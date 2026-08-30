import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createPayment } from "./action";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AddPaymentPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const fee = await prisma.feeStructure.findFirst({
    where: {
      id,
      enrollment: {
        organizationId: session.user.organizationId,
      },
    },
    include: {
      enrollment: {
        include: {
          student: true,
          course: true,
          branch: true,
          batch: true,
        },
      },
      payments: true,
    },
  });

  if (!fee) {
    notFound();
  }

  const finalAmount = Number(fee.finalAmount);

  const paid = fee.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const remaining = Math.max(finalAmount - paid, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* HEADER */}
      <div>
        <Link
          href={`/fees/${fee.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Fee Details
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add Payment
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Record a payment for{" "}
          {fee.enrollment.student.name}.
        </p>
      </div>

      {/* FEE SUMMARY */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">
          Fee Summary
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Summary
            label="Final Payable"
            value={finalAmount}
          />

          <Summary
            label="Already Paid"
            value={paid}
          />

          <Summary
            label="Remaining"
            value={remaining}
          />
        </div>
      </div>

      {/* PAYMENT FORM */}
      <form
        action={createPayment.bind(null, fee.id)}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Amount
          </label>

          <input
            name="amount"
            type="number"
            min="1"
            max={remaining}
            step="0.01"
            required
            placeholder={`Maximum ₹${remaining.toLocaleString(
              "en-IN"
            )}`}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />

          <p className="mt-1 text-xs text-gray-500">
            Maximum payment allowed: ₹
            {remaining.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Method
          </label>

          <select
            name="paymentMethod"
            defaultValue="CASH"
            required
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Receipt Number
          </label>

          <input
            name="receiptNumber"
            required
            placeholder="e.g. REC-0001"
            className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Notes
          </label>

          <textarea
            name="notes"
            rows={3}
            placeholder="Optional payment notes"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            href={`/fees/${fee.id}`}
            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={remaining <= 0}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Record Payment
          </button>
        </div>
      </form>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-gray-900">
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}