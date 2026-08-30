"use server";

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

  if (!enrollmentId || !totalAmountValue) {
    throw new Error(
      "Enrollment and total fee are required."
    );
  }

  const totalAmount = Number(totalAmountValue);
  const discount = Number(discountValue || "0");

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

  const finalAmount = totalAmount - discount;

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

  redirect(
    `/students/${enrollment.studentId}/fees`
  );
}