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
      {/* HEADER */}
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
          Set fees, discount and subsidy for this student.
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

        {/* FEE DETAILS */}
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
                Enter the original course fee before any discount or subsidy.
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
                Normal fee discount, if applicable.
              </p>
            </div>
          </div>
        </div>

        {/* SUBSIDY */}
        <div className="border-t pt-6">
          <h2 className="mb-1 text-lg font-semibold">
            Subsidy
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Add a subsidy if the student qualifies for a special fee concession.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Type
              </label>

              <select
                name="subsidyType"
                className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
              >
                <option value="">
                  No subsidy
                </option>

                <option value="BPL">
                  BPL — 50% Subsidy
                </option>

                <option value="GOVT_SCHOOL_LETTER">
                  Govt School Letter
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Amount
              </label>

              <input
                name="subsidyAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                placeholder="e.g. 15000"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                For BPL, enter 50% of the total course fee.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Letter
              </label>

              <input
                name="subsidyLetter"
                type="text"
                placeholder="Enter document reference / file URL"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                File upload will be connected later.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Notes
              </label>

              <textarea
                name="subsidyNotes"
                rows={3}
                placeholder="Additional information about the subsidy"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </div>

        {/* CALCULATION */}
        <div className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            Fee Calculation
          </h2>

          <div className="space-y-2 rounded-lg bg-gray-50 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Course Fee
              </span>

              <span className="font-medium">
                Entered above
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Discount
              </span>

              <span className="font-medium">
                Applied during submission
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Subsidy
              </span>

              <span className="font-medium">
                Applied during submission
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold">
                  Final Payable
                </span>

                <span className="font-bold">
                  Calculated automatically
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
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