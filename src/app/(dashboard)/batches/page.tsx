import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BatchesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const batches = await prisma.batch.findMany({
    where: {
      branch: {
        organizationId: session.user.organizationId,
      },
    },
    include: {
      branch: true,
      course: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Batches
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage course batches across all branches.
          </p>
        </div>

        <Link
          href="/batches/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Batch
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Batch
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Course
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Branch
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Duration
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Students
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {batches.map((batch) => (
              <tr
                key={batch.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {batch.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {batch.code}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {batch.course.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {batch.branch.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {batch.startDate.toLocaleDateString()}
                  {" → "}
                  {batch.endDate
                    ? batch.endDate.toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {batch._count.enrollments}
                  {batch.capacity
                    ? ` / ${batch.capacity}`
                    : ""}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                    {batch.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {batches.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">
            No batches found.
          </div>
        )}
      </div>
    </div>
  );
}