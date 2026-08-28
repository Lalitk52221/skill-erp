import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BranchesPage() {
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
      _count: {
        select: {
          students: true,
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
            Branches
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all branches of your organization.
          </p>
        </div>

        <Link
          href="/branches/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Branch
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Branch
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Code
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                State
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Students
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Batches
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {branches.map((branch) => (
              <tr key={branch.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {branch.name}
                  </div>

                  {branch.city && (
                    <div className="text-xs text-gray-500">
                      {branch.city}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {branch.code}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {branch.state.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {branch._count.students}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {branch._count.batches}
                </td>

                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/branches/${branch.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {branches.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">
            No branches found.
          </div>
        )}
      </div>
    </div>
  );
}