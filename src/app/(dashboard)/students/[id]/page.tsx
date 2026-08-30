import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentDetailsPage({ params }: Props) {
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
      branch: {
        include: {
          state: true,
        },
      },
      enrollments: {
        include: {
          course: true,
          batch: true,
          branch: true,
          feeStructure: {
            include: {
              subsidy: true,
              payments: true,
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

  const currentEnrollment = student.enrollments[0];
  const fee = currentEnrollment?.feeStructure;
const totalFee = fee
  ? Number(fee.totalAmount)
  : 0;

const subsidyAmount = fee?.subsidy
  ? Number(fee.subsidy.amount)
  : 0;

const discount = fee
  ? Number(fee.discount)
  : 0;

const finalPayable = fee
  ? Number(fee.finalAmount)
  : 0;

const paidAmount = fee
  ? fee.payments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount),
      0
    )
  : 0;

const remainingAmount = Math.max(
  finalPayable - paidAmount,
  0
);
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <Link
          href="/students"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Students
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>

            <p className="mt-1 text-sm text-gray-500">
              Student Code: {student.studentCode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/students/${student.id}/edit`}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Student
            </Link>

            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Personal Information</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <Info label="Student Name" value={student.name} />

          <Info label="Student Code" value={student.studentCode} />

          <Info label="Gender" value={student.gender} />

          <Info
            label="Date of Birth"
            value={
              student.dateOfBirth
                ? student.dateOfBirth.toLocaleDateString()
                : null
            }
          />

          <Info label="Father's Name" value={student.fatherName} />

          <Info label="Mother's Name" value={student.motherName} />
        </div>
      </div>

      {/* CONTACT */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Contact Information</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <Info label="Phone" value={student.phone} />

          <Info label="Email" value={student.email} />

          <Info label="City" value={student.city} />

          <Info label="District" value={student.district} />

          <div className="md:col-span-2">
            <Info label="Address" value={student.address} />
          </div>
        </div>
      </div>

      {/* CURRENT ENROLLMENT */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Current Enrollment</h2>

        {currentEnrollment ? (
          <div className="grid gap-5 md:grid-cols-4">
            <Info
              label="Branch"
              //   value={currentEnrollment.branchId === student.branchId
              //     ? student.branch.name
              //     : null}
              value={currentEnrollment.branch.name}
            />

            <Info label="Course" value={currentEnrollment.course.name} />

            <Info label="Batch" value={currentEnrollment.batch.name} />

            <Info
              label="Admission Date"
              value={currentEnrollment.admissionDate.toLocaleDateString()}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">No enrollment found.</p>
        )}
      </div>

<div className="rounded-xl border bg-white p-6">
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Fees
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Fee, subsidy and payment information.
      </p>
    </div>

    {fee ? (
      <Link
  href={`/fees/${fee.id}`}
  className="rounded-lg border border-blue-500 px-5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
>
  View Fee Details
</Link>
    ) : (
      <Link
        href={`/students/${student.id}/fees/create`}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Create Fee Structure
      </Link>
    )}
  </div>

  {!currentEnrollment ? (
    <p className="text-sm text-gray-500">
      No enrollment found.
    </p>
  ) : !fee ? (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm font-medium text-gray-900">
        Fee structure not created
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Create the student&apos;s course fee and subsidy details.
      </p>
    </div>
  ) : (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FeeCard
          label="Original Fee"
          value={totalFee}
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
          value={paidAmount}
        />

        <FeeCard
          label="Remaining"
          value={remainingAmount}
        />
      </div>

      {fee.subsidy && (
        <div className="mt-5 rounded-lg bg-gray-50 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Info
              label="Subsidy Type"
              value={formatSubsidyType(
                fee.subsidy.type
              )}
            />

            <Info
              label="Subsidy Amount"
              value={`₹${subsidyAmount.toLocaleString(
                "en-IN"
              )}`}
            />

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Subsidy Document
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
          </div>
        </div>
      )}
    </>
  )}
</div>

      {/* ENROLLMENT HISTORY */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Enrollment History</h2>

        {student.enrollments.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Course
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Batch
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Admission
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Completion
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {student.enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-4 py-3 text-sm">
                      {enrollment.course.name}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {enrollment.batch.name}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {enrollment.admissionDate.toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {enrollment.completionDate
                        ? enrollment.completionDate.toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No enrollment history.</p>
        )}
      </div>

      {/* FUTURE MODULES */}
      {/* <div className="grid gap-4 md:grid-cols-4">
        <ModuleCard
          title="Fees"
          description="Manage fees and payments"
        />

        <ModuleCard
          title="Attendance"
          description="Track student attendance"
        />

        <ModuleCard
          title="Exams"
          description="Exams and results"
        />

        <ModuleCard
          title="Homework"
          description="Assignments and submissions"
        />
      </div> */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link
          href={`/students/${student.id}/fees`}
          className="rounded-xl border bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h3 className="font-semibold text-gray-900">Fees</h3>

          <p className="mt-1 text-sm text-gray-500">Manage fees and payments</p>

          <div className="mt-4 text-xs font-medium text-gray-500">
            Open Fees →
          </div>
        </Link>

        <ModuleCard title="Attendance" description="Track student attendance" />

        <ModuleCard title="Exams" description="Exams and results" />

        <ModuleCard
          title="Homework"
          description="Assignments and submissions"
        />
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
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>

      <p className="mt-1 text-sm text-gray-900">{value || "—"}</p>
    </div>
  );
}

function ModuleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 text-sm text-gray-500">{description}</p>

      <div className="mt-4 text-xs font-medium text-gray-400">Coming next</div>
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

function formatSubsidyType(type: string) {
  if (type === "BPL") {
    return "BPL";
  }

  if (type === "GOVT_SCHOOL_LETTER") {
    return "Govt School Letter";
  }

  return "Other";
}
