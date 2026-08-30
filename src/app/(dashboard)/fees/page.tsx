import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FeesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const fees = await prisma.feeStructure.findMany({
    where: {
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
      subsidy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalOriginalFees = fees.reduce(
    (sum, fee) => sum + Number(fee.totalAmount),
    0,
  );

  const totalSubsidy = fees.reduce(
    (sum, fee) => sum + (fee.subsidy ? Number(fee.subsidy.amount) : 0),
    0,
  );

  const totalPayable = fees.reduce(
    (sum, fee) => sum + Number(fee.finalAmount),
    0,
  );

  const totalPaid = fees.reduce(
    (sum, fee) =>
      sum +
      fee.payments.reduce(
        (paymentSum, payment) => paymentSum + Number(payment.amount),
        0,
      ),
    0,
  );

  const totalPending = Math.max(totalPayable - totalPaid, 0);

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage fees, subsidies and payments.
          </p>
        </div>

        <Link
          href="/fees/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
        >
          + Create Fee
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Original Fees" amount={totalOriginalFees} />

        <SummaryCard title="Total Subsidy" amount={totalSubsidy} />

        <SummaryCard title="Final Payable" amount={totalPayable} />

        <SummaryCard title="Total Paid" amount={totalPaid} />

        <SummaryCard title="Pending" amount={totalPending} />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-275 w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Student
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Action
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Course
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Branch
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Original Fee
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Subsidy
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Payable
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Paid
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Pending
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {fees.map((fee) => {
              const paid = fee.payments.reduce(
                (sum, payment) => sum + Number(payment.amount),
                0,
              );

              const payable = Number(fee.finalAmount);

              const pending = Math.max(payable - paid, 0);

              const subsidyAmount = fee.subsidy
                ? Number(fee.subsidy.amount)
                : 0;

              let status = "PENDING";

              if (pending === 0) {
                status = "PAID";
              } else if (paid > 0) {
                status = "PARTIAL";
              }

              return (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <Link
                      href={`/students/${fee.enrollment.student.id}/fees`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {fee.enrollment.student.name}
                    </Link>

                    <div className="text-xs text-gray-500">
                      {fee.enrollment.student.studentCode}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/fees/${fee.id}`}
                      className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {fee.enrollment.course.name}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {fee.enrollment.branch.name}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    ₹{Number(fee.totalAmount).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {fee.subsidy ? (
                      <div>
                        <div className="font-medium">
                          ₹{subsidyAmount.toLocaleString("en-IN")}
                        </div>

                        <div className="text-xs text-gray-500">
                          {formatSubsidyType(fee.subsidy.type)}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium">
                    ₹{payable.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    ₹{paid.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    ₹{pending.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {fees.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">No fee records found.</p>

            <Link
              href="/fees/new"
              className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
            >
              Create first fee →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, amount }: { title: string; amount: number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        ₹{amount.toLocaleString("en-IN")}
      </p>
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
