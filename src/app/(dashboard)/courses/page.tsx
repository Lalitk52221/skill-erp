import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: {
          branches: true,
          enrollments: true,
          batches: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Courses
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage courses offered by your organization.
          </p>
        </div>

        <Link
          href="/courses/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Course
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Course
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Code
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Duration
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Branches
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Students
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {course.name}
                  </div>

                  {course.description && (
                    <div className="text-xs text-gray-500">
                      {course.description}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {course.code}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {course.durationMonths
                    ? `${course.durationMonths} months`
                    : "—"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {course._count.branches}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {course._count.enrollments}
                </td>

                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
}