import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createStudent } from "../actions";
import StudentForm from "./student-form";

export default async function NewStudentPage() {
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
      batches: {
        include: {
          course: true,
        },
        orderBy: {
          startDate: "desc",
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
      durationMonths: branchCourse.course.durationMonths,
    })),

    batches: branch.batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
      code: batch.code,
      courseId: batch.courseId,
      startDate: batch.startDate.toISOString(),
      endDate: batch.endDate
        ? batch.endDate.toISOString()
        : null,
      status: batch.status,
    })),
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/students"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Students
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add Student
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add student information and enroll them into a batch.
        </p>
      </div>

      <StudentForm
        branches={branchData}
        action={createStudent}
      />
    </div>
  );
}