"use server";
import { SubsidyType } from "@/generated/prisma";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createFeeStructure(
  formData: FormData
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const enrollmentId = formData
    .get("enrollmentId")
    ?.toString();

  const totalAmountValue = formData
    .get("totalAmount")
    ?.toString();

  const discountValue = formData
    .get("discount")
    ?.toString();

const subsidyTypeValue =
  formData.get("subsidyType")?.toString();

const subsidyType = subsidyTypeValue
  ? (subsidyTypeValue as SubsidyType)
  : undefined;

  const subsidyAmountValue = formData
    .get("subsidyAmount")
    ?.toString();

  const subsidyLetter =
    formData.get("subsidyLetter")?.toString().trim() || null;

  const subsidyNotes =
    formData.get("subsidyNotes")?.toString().trim() || null;

  if (!enrollmentId || !totalAmountValue) {
    throw new Error(
      "Enrollment and total fee are required."
    );
  }

  const totalAmount = Number(totalAmountValue);
  const discount = Number(discountValue || "0");
  let subsidyAmount = Number(
    subsidyAmountValue || "0"
  );

  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    throw new Error("Invalid total fee.");
  }

  if (!Number.isFinite(discount) || discount < 0) {
    throw new Error("Invalid discount.");
  }

  if (discount > totalAmount) {
    throw new Error(
      "Discount cannot be greater than total fee."
    );
  }

  if (
    !Number.isFinite(subsidyAmount) ||
    subsidyAmount < 0
  ) {
    throw new Error("Invalid subsidy amount.");
  }

  // BPL = 50% of total course fee
  if (subsidyType === "BPL") {
    subsidyAmount = totalAmount / 2;
  }

  const enrollment =
    await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        organizationId,
      },
    });

  if (!enrollment) {
    throw new Error("Invalid enrollment.");
  }

  const existingFee =
    await prisma.feeStructure.findUnique({
      where: {
        enrollmentId,
      },
    });

  if (existingFee) {
    throw new Error(
      "Fee structure already exists for this enrollment."
    );
  }

  const finalAmount =
    totalAmount - discount - subsidyAmount;

  if (finalAmount < 0) {
    throw new Error(
      "Discount and subsidy cannot be greater than the total fee."
    );
  }

  const feeStructure =
    await prisma.feeStructure.create({
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

  if (subsidyType && subsidyAmount > 0) {
    await prisma.subsidy.create({
      data: {
        feeStructureId: feeStructure.id,
        type: subsidyType,
        amount: subsidyAmount,
        letterUrl: subsidyLetter,
        notes: subsidyNotes,
      },
    });
  }

  redirect(
    `/students/${enrollment.studentId}/fees`
  );
}