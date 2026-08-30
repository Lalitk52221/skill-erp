import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createExam } from "./actions";

export default async function NewExamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const [branches, courses, batches] = await Promise.all([
    prisma.branch.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.course.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.batch.findMany({
      where: {
        branch: {
          organizationId,
        },
      },
      include: {
        branch: true,
        course: true,
      },
      orderBy: {
        startDate: "desc",
      },
    }),
  ]);

  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-6">
        <Link
          href="/exams"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Exams
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Create Exam
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create an exam for a specific course, branch and batch.
        </p>
      </div>

      <form action={createExam} className="space-y-6">
        {/* BASIC INFORMATION */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Exam Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* EXAM NAME */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Exam Name
              </label>

              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Final Assessment"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {/* EXAM TYPE */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Exam Type
              </label>

              <select
                name="examType"
                required
                defaultValue="THEORY"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                <option value="THEORY">
                  Theory
                </option>

                <option value="PRACTICAL">
                  Practical
                </option>

                <option value="MCQ">
                  MCQ / Online
                </option>
              </select>

              <p className="mt-2 text-xs text-gray-500">
                MCQ exams will be conducted online through the portal.
              </p>
            </div>

            {/* EXAM DATE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Exam Date
              </label>

              <input
                type="date"
                name="examDate"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="status"
                defaultValue="DRAFT"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                <option value="DRAFT">
                  Draft
                </option>

                <option value="SCHEDULED">
                  Scheduled
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="RESULTS_PUBLISHED">
                  Results Published
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* COURSE / BRANCH / BATCH */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Course & Batch
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* BRANCH */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Branch
              </label>

              <select
                name="branchId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              >
                <option value="" disabled>
                  Select Branch
                </option>

                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Course
              </label>

              <select
                name="courseId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              >
                <option value="" disabled>
                  Select Course
                </option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BATCH */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Batch
              </label>

              <select
                name="batchId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              >
                <option value="" disabled>
                  Select Batch
                </option>

                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} — {batch.course.name} —{" "}
                    {batch.branch.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Students enrolled in this batch will be eligible for the
                exam.
              </p>
            </div>
          </div>
        </div>

        {/* MARKS */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Marks
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* MAX MARKS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Maximum Marks
              </label>

              <input
                type="number"
                name="maxMarks"
                required
                min="1"
                step="0.01"
                placeholder="100"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>

            {/* PASSING MARKS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Passing Marks
              </label>

              <input
                type="number"
                name="passingMarks"
                required
                min="0"
                step="0.01"
                placeholder="40"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* MCQ INFORMATION */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            MCQ / Online Exam
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            If you select MCQ / Online above, questions will be added
            after the exam is created.
          </p>

          <div className="mt-4 rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-900">
              Next step after creation
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add MCQ questions, configure the exam timer and publish
              the exam for students.
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <Link
            href="/exams"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Exam
          </button>
        </div>
      </form>
    </div>
  );
}