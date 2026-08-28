import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createBatch } from "../actions";
import BatchForm from "./batch-form";

export default async function NewBatchPage() {
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
      courses: {
        include: {
          course: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const branchData = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    stateName: branch.state.name,

    courses: branch.courses.map((branchCourse) => ({
      id: branchCourse.course.id,
      name: branchCourse.course.name,
      code: branchCourse.course.code,
      durationMonths:
        branchCourse.course.durationMonths,
    })),
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/batches"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Batches
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add Batch
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new batch for a course and branch.
        </p>
      </div>

      <BatchForm
        branches={branchData}
        action={createBatch}
      />
    </div>
  );
}