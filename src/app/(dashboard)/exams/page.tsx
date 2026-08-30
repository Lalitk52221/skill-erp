import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExamsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const exams = await prisma.exam.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      course: true,
      branch: true,
      batch: true,
      _count: {
        select: {
          results: true,
        },
      },
    },
    orderBy: {
      examDate: "desc",
    },
  });

  const totalExams = exams.length;

  const upcomingExams = exams.filter(
    (exam) =>
      exam.status === "SCHEDULED"
  ).length;

  const completedExams = exams.filter(
    (exam) =>
      exam.status === "COMPLETED"
  ).length;

  const publishedExams = exams.filter(
    (exam) =>
      exam.status === "RESULTS_PUBLISHED"
  ).length;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Exams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage examinations, schedules and student results.
          </p>
        </div>

        <Link
          href="/exams/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Create Exam
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Exams
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalExams}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Upcoming
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {upcomingExams}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {completedExams}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Results Published
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {publishedExams}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Exam
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Course
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Branch
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Batch
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Marks
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Students
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {exams.map((exam) => (
                <tr
                  key={exam.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {exam.name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {exam.examType.replaceAll("_", " ")}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exam.course.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exam.branch.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exam.batch.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exam.examDate.toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {Number(exam.maxMarks)} /{" "}
                    {Number(exam.passingMarks)}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exam._count.results}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {exam.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/exams/${exam.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exams.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">
              No exams have been created yet.
            </p>

            <Link
              href="/exams/new"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Create your first exam
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}