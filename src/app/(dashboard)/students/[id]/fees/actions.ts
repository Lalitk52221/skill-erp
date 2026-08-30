"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SubsidyType } from "@/generated/prisma";
import { redirect } from "next/navigation";

export async function saveSubsidy(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const feeStructureId = formData
    .get("feeStructureId")
    ?.toString();

const subsidyTypeValue = formData.get("subsidyType")?.toString();

const subsidyType = subsidyTypeValue
  ? (subsidyTypeValue as SubsidyType)
  : null;

  const subsidyAmountValue = formData
    .get("subsidyAmount")
    ?.toString()
    .trim();

  const letterUrl =
    formData.get("letterUrl")?.toString().trim() || null;

  if (!feeStructureId) {
    throw new Error("Fee structure is required.");
  }

  if (!subsidyType) {
    throw new Error("Subsidy type is required.");
  }

  const subsidyAmount = Number(subsidyAmountValue);

  if (
    !subsidyAmountValue ||
    Number.isNaN(subsidyAmount) ||
    subsidyAmount < 0
  ) {
    throw new Error("Enter a valid subsidy amount.");
  }

  /*
   * Make sure this fee belongs to the
   * logged-in organization.
   */
  const fee = await prisma.feeStructure.findFirst({
    where: {
      id: feeStructureId,
      enrollment: {
        organizationId,
      },
    },
    include: {
      subsidy: true,
      enrollment: true,
    },
  });

  if (!fee) {
    throw new Error("Fee structure not found.");
  }

  /*
   * Calculate the final payable amount.
   *
   * Original fee
   * - existing discount
   * - subsidy
   */
  const totalAmount = Number(fee.totalAmount);
  const discount = Number(fee.discount);

  const finalAmount = Math.max(
    totalAmount - discount - subsidyAmount,
    0
  );

  if (fee.subsidy) {
    await prisma.subsidy.update({
      where: {
        id: fee.subsidy.id,
      },
      data: {
        type: subsidyType,
        amount: subsidyAmount,
        letterUrl,
      },
    });
  } else {
    await prisma.subsidy.create({
      data: {
        feeStructureId,
        type: subsidyType,
        amount: subsidyAmount,
        letterUrl,
      },
    });
  }

  await prisma.feeStructure.update({
    where: {
      id: feeStructureId,
    },
    data: {
      finalAmount,
    },
  });

  redirect(
    `/students/${fee.enrollment.studentId}/fees`
  );
}