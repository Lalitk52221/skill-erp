import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  createExamQuestion,
  deleteExamQuestion,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExamQuestionsPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const exam = await prisma.exam.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      course: true,
      branch: true,
      batch: true,
      questions: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  if (exam.examType !== "MCQ") {
    return (
      <div className="max-w-3xl">
        <Link
          href="/exams"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Exams
        </Link>

        <div className="mt-6 rounded-xl border bg-white p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            MCQ Questions Not Available
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This exam is not configured as an MCQ exam.
          </p>
        </div>
      </div>
    );
  }

  const totalQuestionMarks = exam.questions.reduce(
    (sum, question) => sum + Number(question.marks),
    0
  );

  return (
    <div className="max-w-5xl space-y-6">
      {/* HEADER */}
      <div>
        <Link
          href="/exams"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Exams
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {exam.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {exam.course.name} • {exam.batch.name} •{" "}
            {exam.branch.name}
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Questions
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {exam.questions.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Question Marks
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalQuestionMarks}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Maximum Marks
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {Number(exam.maxMarks)}
          </p>
        </div>
      </div>

      {/* ADD QUESTION */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Add MCQ Question
        </h2>

        <form
          action={createExamQuestion.bind(null, exam.id)}
          className="space-y-5"
        >
          {/* QUESTION */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Question
            </label>

            <textarea
              name="question"
              required
              rows={3}
              placeholder="Enter the question..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          {/* OPTIONS */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Option A
              </label>

              <input
                name="optionA"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Option B
              </label>

              <input
                name="optionB"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Option C
              </label>

              <input
                name="optionC"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Option D
              </label>

              <input
                name="optionD"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* ANSWER + MARKS */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Correct Answer
              </label>

              <select
                name="correctAnswer"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              >
                <option value="" disabled>
                  Select correct answer
                </option>

                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Marks
              </label>

              <input
                type="number"
                name="marks"
                min="0.01"
                step="0.01"
                defaultValue="1"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Add Question
            </button>
          </div>
        </form>
      </div>

      {/* QUESTIONS */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions
          </h2>

          <span className="text-sm text-gray-500">
            {exam.questions.length} question
            {exam.questions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {exam.questions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-gray-500">
              No questions added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exam.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-lg border p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Q{index + 1}. {question.question}
                    </p>

                    <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                      <p>
                        <span className="font-medium">
                          A:
                        </span>{" "}
                        {question.optionA}
                      </p>

                      <p>
                        <span className="font-medium">
                          B:
                        </span>{" "}
                        {question.optionB}
                      </p>

                      <p>
                        <span className="font-medium">
                          C:
                        </span>{" "}
                        {question.optionC}
                      </p>

                      <p>
                        <span className="font-medium">
                          D:
                        </span>{" "}
                        {question.optionD}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-4 text-xs">
                      <span className="rounded-full bg-gray-100 px-3 py-1">
                        Correct: {question.correctAnswer}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1">
                        Marks: {Number(question.marks)}
                      </span>
                    </div>
                  </div>

                  <form
                    action={deleteExamQuestion.bind(
                      null,
                      question.id,
                      exam.id
                    )}
                  >
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}