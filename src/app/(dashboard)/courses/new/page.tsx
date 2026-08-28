import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createCourse } from "../actions";

export default async function NewCoursePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const branches = await prisma.branch.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      state: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/courses"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Courses
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add Course
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a course and select the branches where it
          will be available.
        </p>
      </div>

      <form
        action={createCourse}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Course Name
          </label>

          <input
            name="name"
            required
            placeholder="e.g. Advanced Computer"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Course Code
          </label>

          <input
            name="code"
            required
            placeholder="e.g. ADC"
            maxLength={20}
            className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Duration
          </label>

          <div className="flex items-center gap-3">
            <input
              name="durationMonths"
              type="number"
              min="1"
              placeholder="6"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />

            <span className="text-sm text-gray-500">
              months
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            name="description"
            rows={4}
            placeholder="Course description..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">
            Available at Branches
          </label>

          <div className="space-y-3 rounded-lg border p-4">
            {branches.map((branch) => (
              <label
                key={branch.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  name="branchIds"
                  value={branch.id}
                  className="h-4 w-4"
                />

                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {branch.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {branch.state.name} · {branch.code}
                  </div>
                </div>
              </label>
            ))}

            {branches.length === 0 && (
              <p className="text-sm text-gray-500">
                No branches available. Create a branch first.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/courses"
            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Course
          </button>
        </div>
      </form>
    </div>
  );
}