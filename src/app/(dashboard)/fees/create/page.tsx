import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createFeeStructure } from "./actions";


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CreateFeePage({
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
          feeStructure: true,
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
    notFound();
  }

  if (enrollment.feeStructure) {
    redirect(`/students/${student.id}/fees`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/students/${student.id}/fees`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Fees
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Create Fee Structure
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Set the fee structure for this student&apos;s enrollment.
        </p>
      </div>

      {/* STUDENT INFORMATION */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">
          Student Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Info
            label="Student"
            value={student.name}
          />

          <Info
            label="Student Code"
            value={student.studentCode}
          />

          <Info
            label="Course"
            value={enrollment.course.name}
          />

          <Info
            label="Batch"
            value={enrollment.batch.name}
          />

          <Info
            label="Branch"
            value={enrollment.branch.name}
          />

          <Info
            label="Admission Date"
            value={enrollment.admissionDate.toLocaleDateString()}
          />
        </div>
      </div>

      {/* FEE FORM */}
      <form
        action={createFeeStructure}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        <input
          type="hidden"
          name="enrollmentId"
          value={enrollment.id}
        />

        <div>
          <h2 className="mb-5 text-lg font-semibold">
            Fee Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Total Course Fee
              </label>

              <input
                name="totalAmount"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 30000"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter the total fee before discount.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Discount
              </label>

              <input
                name="discount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                required
                placeholder="e.g. 2000"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter 0 if there is no discount.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Final Fee
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            Calculated automatically
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Final Fee = Total Fee − Discount
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            href={`/students/${student.id}/fees`}
            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Fee Structure
          </button>
        </div>
      </form>
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