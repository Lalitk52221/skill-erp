import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { saveSubsidy } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentFeesPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const student = await prisma.student.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      enrollments: {
        include: {
          course: true,
          batch: true,
          branch: true,
          feeStructure: {
            include: {
              subsidy: true,
              payments: {
                orderBy: {
                  paymentDate: "desc",
                },
              },
            },
          },
        },
        orderBy: {
          admissionDate: "desc",
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const enrollment = student.enrollments[0];

  if (!enrollment) {
    return (
      <div className="space-y-4">
        <Link
          href={`/students/${student.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Student
        </Link>

        <div className="rounded-xl border bg-white p-8">
          <h1 className="text-xl font-semibold">
            No enrollment found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This student does not have an enrollment yet.
          </p>
        </div>
      </div>
    );
  }

  const fee = enrollment.feeStructure;

  if (!fee) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`/students/${student.id}`}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Student
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Fees
          </h1>
        </div>

        <div className="rounded-xl border bg-white p-8">
          <h2 className="text-lg font-semibold">
            Fee Structure Not Created
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            No fee structure has been created for this
            student&apos;s current enrollment.
          </p>

          <Link
            href="/fees/new"
            className="mt-5 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Fee Structure
          </Link>
        </div>
      </div>
    );
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

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <Link
          href={`/students/${student.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Student
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Fee Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {student.name} — {student.studentCode}
          </p>
        </div>
      </div>

      {/* STUDENT / ENROLLMENT */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">
          Enrollment
        </h2>

        <div className="grid gap-5 md:grid-cols-4">
          <Info
            label="Student"
            value={student.name}
          />

          <Info
            label="Branch"
            value={enrollment.branch.name}
          />

          <Info
            label="Course"
            value={enrollment.course.name}
          />

          <Info
            label="Batch"
            value={enrollment.batch.name}
          />
        </div>
      </div>

      {/* FEE SUMMARY */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">
          Fee Summary
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeeCard
            label="Original Fee"
            value={originalFee}
          />

          <FeeCard
            label="Discount"
            value={discount}
          />

          <FeeCard
            label="Subsidy"
            value={subsidyAmount}
          />

          <FeeCard
            label="Final Payable"
            value={finalPayable}
          />

          <FeeCard
            label="Paid"
            value={paid}
          />

          <FeeCard
            label="Remaining"
            value={remaining}
          />
        </div>
      </div>

      {/* SUBSIDY */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">
          Subsidy
        </h2>

        <p className="mb-5 text-sm text-gray-500">
          Add or update the subsidy applicable to this
          student.
        </p>

        <form
          action={saveSubsidy}
          className="space-y-5"
        >
          <input
            type="hidden"
            name="feeStructureId"
            value={fee.id}
          />

          <div className="grid gap-5 md:grid-cols-2">

            {/* TYPE */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Type
              </label>

              <select
                name="subsidyType"
                required
                defaultValue={
                  fee.subsidy?.type || ""
                }
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
              >
                <option value="">
                  Select subsidy type
                </option>

                <option value="BPL">
                  BPL
                </option>

                <option value="GOVT_SCHOOL_LETTER">
                  Govt School Letter
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* AMOUNT */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Amount
              </label>

              <input
                name="subsidyAmount"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={
                  fee.subsidy
                    ? Number(
                        fee.subsidy.amount
                      )
                    : 0
                }
                placeholder="e.g. 600"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            {/* DOCUMENT LINK */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Subsidy Letter / Document Link
              </label>

              <input
                name="letterUrl"
                type="url"
                defaultValue={
                  fee.subsidy?.letterUrl || ""
                }
                placeholder="https://drive.google.com/..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                Paste the Google Drive, OneDrive or other
                document link.
              </p>
            </div>
          </div>

          {fee.subsidy?.letterUrl && (
            <div>
              <a
                href={fee.subsidy.letterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                View Current Subsidy Document
              </a>
            </div>
          )}

          <div className="border-t pt-5">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save Subsidy
            </button>
          </div>
        </form>
      </div>

      {/* PAYMENTS */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Payments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Payment history for this fee.
            </p>
          </div>

          <Link
            href={`/fees/${fee.id}`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Manage Payments
          </Link>
        </div>

        {fee.payments.length === 0 ? (
          <p className="mt-5 text-sm text-gray-500">
            No payments recorded yet.
          </p>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border">
            <table className="w-full">
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
                </tr>
              </thead>

              <tbody className="divide-y">
                {fee.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm">
                      {payment.receiptNumber}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {payment.paymentDate.toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium">
                      ₹
                      {Number(
                        payment.amount
                      ).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

function FeeCard({
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

      <p className="mt-2 text-lg font-semibold text-gray-900">
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}