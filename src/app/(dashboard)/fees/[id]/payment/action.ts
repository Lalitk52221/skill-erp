"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function createPayment(
  feeStructureId: string,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const amountValue = formData.get("amount")?.toString().trim();
  const paymentMethod =
    formData.get("paymentMethod")?.toString() || "CASH";
  const receiptNumber =
    formData.get("receiptNumber")?.toString().trim();
  const notes =
    formData.get("notes")?.toString().trim() || null;

  if (!amountValue || !receiptNumber) {
    throw new Error(
      "Amount and receipt number are required."
    );
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const fee = await prisma.feeStructure.findFirst({
    where: {
      id: feeStructureId,
      enrollment: {
        organizationId,
      },
    },
    include: {
      payments: true,
    },
  });

  if (!fee) {
    throw new Error("Fee structure not found.");
  }

  const finalAmount = Number(fee.finalAmount);

  const alreadyPaid = fee.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const remaining = finalAmount - alreadyPaid;

  if (remaining <= 0) {
    throw new Error("This fee has already been fully paid.");
  }

  if (amount > remaining) {
    throw new Error(
      `Payment cannot be greater than the remaining amount of ₹${remaining.toLocaleString(
        "en-IN"
      )}.`
    );
  }

  const existingReceipt = await prisma.payment.findUnique({
    where: {
      receiptNumber,
    },
  });

  if (existingReceipt) {
    throw new Error(
      "A payment with this receipt number already exists."
    );
  }

  const newPaidAmount = alreadyPaid + amount;

  let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";

  if (newPaidAmount >= finalAmount) {
    status = "PAID";
  } else if (newPaidAmount > 0) {
    status = "PARTIAL";
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        feeStructureId,
        amount,
        paymentMethod: paymentMethod as
          | "CASH"
          | "UPI"
          | "CARD"
          | "BANK_TRANSFER"
          | "CHEQUE"
          | "OTHER",
        receiptNumber,
        notes,
      },
    }),

    prisma.feeStructure.update({
      where: {
        id: feeStructureId,
      },
      data: {
        status,
      },
    }),
  ]);

  redirect(`/fees/${feeStructureId}`);
}