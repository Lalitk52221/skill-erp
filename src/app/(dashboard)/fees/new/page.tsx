import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createFee } from "../actions";

export default async function NewFeePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  /*
    Only fetch enrollments that don't already have
    a FeeStructure.
  */
  const enrollments =
    await prisma.enrollment.findMany({
      where: {
        organizationId:
          session.user.organizationId,

        feeStructure: null,
      },

      include: {
        student: true,
        branch: true,
        course: true,
        batch: true,
      },

      orderBy: {
        admissionDate: "desc",
      },
    });

  return (
    <div className="max-w-3xl">
      {/* HEADER */}
      <div className="mb-6">
        <Link
          href="/fees"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Fees
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Create Fee Structure
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Set the fee and subsidy for a student
          enrollment.
        </p>
      </div>

      <form
        action={createFee}
        className="space-y-8 rounded-xl border bg-white p-6"
      >
        {/* STUDENT */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Student & Enrollment
          </h2>

          <label className="mb-2 block text-sm font-medium">
            Student
          </label>

          <select
            name="enrollmentId"
            required
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
          >
            <option value="">
              Select student
            </option>

            {enrollments.map(
              (enrollment) => (
                <option
                  key={enrollment.id}
                  value={enrollment.id}
                >
                  {enrollment.student.name}
                  {" — "}
                  {
                    enrollment.student
                      .studentCode
                  }
                  {" — "}
                  {enrollment.course.name}
                  {" — "}
                  {enrollment.branch.name}
                  {" — "}
                  {enrollment.batch.name}
                </option>
              )
            )}
          </select>

          {enrollments.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              All current enrollments already
              have fee structures.
            </p>
          )}
        </div>

        {/* FEES */}
        <div className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            Fee Details
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
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
                placeholder="30000"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Normal Discount
              </label>

              <input
                name="discount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </div>

        {/* SUBSIDY */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold">
            Subsidy
          </h2>

          <p className="mb-5 mt-1 text-sm text-gray-500">
            Leave subsidy type empty if the
            student has no subsidy.
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
                  No Subsidy
                </option>

                <option value="BPL">
                  BPL — 50%
                </option>

                <option value="GOVT_SCHOOL_LETTER">
                  Government School Letter
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
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                For BPL you can leave this at
                ₹0. The server will automatically
                calculate 50% of the original fee.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subsidy Letter / Document
              </label>

              <input
                name="letterUrl"
                type="text"
                placeholder="Document reference or URL"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />

              <p className="mt-1 text-xs text-gray-500">
                We&lsquo;ll replace this with real
                PDF/image upload later.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Notes
              </label>

              <textarea
                name="subsidyNotes"
                rows={3}
                placeholder="Subsidy details..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </div>

        {/* EXPLANATION */}
        <div className="rounded-xl bg-gray-50 p-5">
          <h3 className="font-semibold">
            Fee Calculation
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            Final payable =
            Course Fee − Discount − Subsidy
          </p>

          <p className="mt-2 text-xs text-gray-500">
            BPL automatically receives 50% of
            the original course fee as subsidy.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            href="/fees"
            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={enrollments.length === 0}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Fee
          </button>
        </div>
      </form>
    </div>
  );
}