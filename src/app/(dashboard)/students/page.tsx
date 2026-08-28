import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const students = await prisma.student.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      branch: true,
      enrollments: {
        include: {
          course: true,
          batch: true,
        },
        orderBy: {
          admissionDate: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage students and their enrollments.
          </p>
        </div>

        <Link
          href="/students/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Student
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Student
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Phone
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Branch
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Course
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Batch
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {students.map((student) => {
              const enrollment = student.enrollments[0];

              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {student.name}
                    </Link>

                    <div className="text-xs text-gray-500">
                      {student.studentCode}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {student.phone || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {student.branch.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {enrollment?.course.name || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {enrollment?.batch.name || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                      {student.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">
            No students found.
          </div>
        )}
      </div>
    </div>
  );
}
