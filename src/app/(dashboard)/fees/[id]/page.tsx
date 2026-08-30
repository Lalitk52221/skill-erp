import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FeeDetailsPage({
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

      subsidy: true,

      payments: {
        orderBy: {
          paymentDate: "desc",
        },
      },
    },
  });

  if (!fee) {
    notFound();
  }

  const originalFee = Number(fee.totalAmount);
  const discount = Number(fee.discount);

  const subsidyAmount = fee.subsidy
    ? Number(fee.subsidy.amount)
    : 0;

  const finalPayable = Number(fee.finalAmount);

  const paid = fee.payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount),
    0
  );

  const remaining = Math.max(
    finalPayable - paid,
    0
  );

  let status = "PENDING";

  if (remaining === 0) {
    status = "PAID";
  } else if (paid > 0) {
    status = "PARTIAL";
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <Link
          href="/fees"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Fees
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fee Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {fee.enrollment.student.name} —{" "}
              {fee.enrollment.student.studentCode}
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
            {status}
          </span>
        </div>
      </div>

      {/* STUDENT INFORMATION */}

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Student & Enrollment
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Info
            label="Student"
            value={fee.enrollment.student.name}
          />

          <Info
            label="Student Code"
            value={
              fee.enrollment.student.studentCode
            }
          />

          <Info
            label="Branch"
            value={fee.enrollment.branch.name}
          />

          <Info
            label="Course"
            value={fee.enrollment.course.name}
          />

          <Info
            label="Batch"
            value={fee.enrollment.batch.name}
          />

          <Info
            label="Admission Date"
            value={fee.enrollment.admissionDate.toLocaleDateString(
              "en-IN"
            )}
          />
        </div>
      </div>

      {/* FEE SUMMARY */}

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Fee Summary
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyCard
            label="Original Fee"
            amount={originalFee}
          />

          <MoneyCard
            label="Discount"
            amount={discount}
          />

          <MoneyCard
            label="Subsidy"
            amount={subsidyAmount}
          />

          <MoneyCard
            label="Final Payable"
            amount={finalPayable}
          />

          <MoneyCard
            label="Paid"
            amount={paid}
          />

          <MoneyCard
            label="Remaining"
            amount={remaining}
          />
        </div>
      </div>

      {/* CALCULATION */}

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Fee Calculation
        </h2>

        <div className="max-w-xl space-y-3">
          <CalculationRow
            label="Original Fee"
            amount={originalFee}
          />

          <CalculationRow
            label="Less: Discount"
            amount={discount}
            minus
          />

          <CalculationRow
            label="Less: Subsidy"
            amount={subsidyAmount}
            minus
          />

          <div className="border-t pt-3">
            <CalculationRow
              label="Final Payable"
              amount={finalPayable}
              bold
            />
          </div>
        </div>
      </div>

      {/* SUBSIDY */}

      <div className="rounded-xl border bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subsidy Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Subsidy applied to this fee.
            </p>
          </div>

          <Link
            href={`/students/${fee.enrollment.student.id}/fees`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Manage Subsidy
          </Link>
        </div>

        {fee.subsidy ? (
          <div className="grid gap-5 rounded-lg border p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Info
              label="Subsidy Type"
              value={formatSubsidyType(
                fee.subsidy.type
              )}
            />

            <Info
              label="Subsidy Amount"
              value={`₹${Number(
                fee.subsidy.amount
              ).toLocaleString("en-IN")}`}
            />

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Document
              </p>

              {fee.subsidy.letterUrl ? (
                <a
                  href={fee.subsidy.letterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  View Document
                </a>
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  —
                </p>
              )}
            </div>

            <Info
              label="Notes"
              value={fee.subsidy.notes}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">
              No subsidy applied to this fee.
            </p>

            <Link
              href={`/students/${fee.enrollment.student.id}/fees`}
              className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
            >
              Add Subsidy →
            </Link>
          </div>
        )}
      </div>

      {/* PAYMENT HISTORY */}

      <div className="rounded-xl border bg-white p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Payments received against this fee.
            </p>
          </div>

          {remaining > 0 && (
            <Link
              href={`/fees/${fee.id}/payment`}
              className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
            >
              + Add Payment
            </Link>
          )}
        </div>

        {fee.payments.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-175">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Receipt
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Method
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {fee.payments.map(
                  (payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm font-medium">
                        {
                          payment.receiptNumber
                        }
                      </td>

                      <td className="px-4 py-3 text-sm">
                        {payment.paymentDate.toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        {formatPaymentMethod(
                          payment.paymentMethod
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium">
                        ₹
                        {Number(
                          payment.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">
                        {payment.notes || "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">
              No payments have been recorded.
            </p>

            {remaining > 0 && (
              <Link
                href={`/fees/${fee.id}/payment`}
                className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
              >
                Record first payment →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}

function MoneyCard({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="rounded-lg border p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        ₹{amount.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function CalculationRow({
  label,
  amount,
  minus = false,
  bold = false,
}: {
  label: string;
  amount: number;
  minus?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          bold
            ? "font-semibold text-gray-900"
            : "text-sm text-gray-600"
        }
      >
        {label}
      </span>

      <span
        className={
          bold
            ? "text-lg font-bold text-gray-900"
            : "text-sm font-medium text-gray-700"
        }
      >
        {minus ? "- " : ""}
        ₹{amount.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function formatSubsidyType(type: string) {
  if (type === "BPL") {
    return "BPL";
  }

  if (type === "GOVT_SCHOOL_LETTER") {
    return "Govt School Letter";
  }

  return "Other";
}

function formatPaymentMethod(method: string) {
  return method
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}