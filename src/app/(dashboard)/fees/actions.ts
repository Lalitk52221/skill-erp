"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createFee(
  formData: FormData
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId =
    session.user.organizationId;

  const enrollmentId =
    formData.get("enrollmentId")?.toString();

  const totalAmountValue =
    formData.get("totalAmount")?.toString();

  const discountValue =
    formData.get("discount")?.toString();

  const subsidyType =
    formData.get("subsidyType")?.toString();

  const subsidyAmountValue =
    formData.get("subsidyAmount")?.toString();

  const letterUrl =
    formData.get("letterUrl")?.toString().trim() ||
    null;

  const subsidyNotes =
    formData
      .get("subsidyNotes")
      ?.toString()
      .trim() || null;

  if (!enrollmentId || !totalAmountValue) {
    throw new Error(
      "Enrollment and total amount are required."
    );
  }

  const totalAmount =
    Number(totalAmountValue);

  const discount =
    Number(discountValue || 0);

  let subsidyAmount =
    Number(subsidyAmountValue || 0);

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {
    throw new Error(
      "Total fee must be greater than zero."
    );
  }

  if (
    !Number.isFinite(discount) ||
    discount < 0
  ) {
    throw new Error("Invalid discount.");
  }

  if (discount > totalAmount) {
    throw new Error(
      "Discount cannot exceed the course fee."
    );
  }

  const enrollment =
    await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        organizationId,
      },
    });

  if (!enrollment) {
    throw new Error(
      "Invalid student enrollment."
    );
  }

  const existingFee =
    await prisma.feeStructure.findUnique({
      where: {
        enrollmentId,
      },
    });

  if (existingFee) {
    throw new Error(
      "A fee structure already exists for this enrollment."
    );
  }

  /*
   * BPL subsidy is always 50%
   * of the ORIGINAL course fee.
   */
  if (subsidyType === "BPL") {
    subsidyAmount =
      totalAmount * 0.5;
  }

  if (
    !Number.isFinite(subsidyAmount) ||
    subsidyAmount < 0
  ) {
    throw new Error(
      "Invalid subsidy amount."
    );
  }

  const finalAmount =
    totalAmount -
    discount -
    subsidyAmount;

  if (finalAmount < 0) {
    throw new Error(
      "Discount and subsidy cannot exceed the total fee."
    );
  }

  /*
   * FeeStructure + Subsidy should be
   * created atomically.
   */
  await prisma.$transaction(
    async (tx) => {
      const fee =
        await tx.feeStructure.create({
          data: {
            enrollmentId,
            totalAmount,
            discount,
            finalAmount,

            status:
              finalAmount === 0
                ? "PAID"
                : "PENDING",
          },
        });

      if (
        subsidyType &&
        subsidyAmount > 0
      ) {
        if (
          ![
            "BPL",
            "GOVT_SCHOOL_LETTER",
            "OTHER",
          ].includes(subsidyType)
        ) {
          throw new Error(
            "Invalid subsidy type."
          );
        }

        await tx.subsidy.create({
          data: {
            feeStructureId: fee.id,

            type: subsidyType as
              | "BPL"
              | "GOVT_SCHOOL_LETTER"
              | "OTHER",

            amount: subsidyAmount,

            letterUrl,

            notes: subsidyNotes,
          },
        });
      }
    }
  );

  redirect(
    `/students/${enrollment.studentId}/fees`
  );
}