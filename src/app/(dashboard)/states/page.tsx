import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StatesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const states = await prisma.state.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: {
          branches: true,
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
            States
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage states for your organization.
          </p>
        </div>

        <Link
          href="/states/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add State
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                State
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Code
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Branches
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {states.map((state) => (
              <tr key={state.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {state.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {state.code}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {state._count.branches}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {states.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">
            No states found.
          </div>
        )}
      </div>
    </div>
  );
}