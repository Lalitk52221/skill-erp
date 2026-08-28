"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createBatch(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const name = formData.get("name")?.toString().trim();
  const code = formData.get("code")?.toString().trim().toUpperCase();
  const branchId = formData.get("branchId")?.toString();
  const courseId = formData.get("courseId")?.toString();
  const startDateValue = formData.get("startDate")?.toString();
  const endDateValue = formData.get("endDate")?.toString();
  const capacityValue = formData.get("capacity")?.toString();

  if (!name || !code || !branchId || !courseId || !startDateValue) {
    throw new Error(
      "Batch name, code, branch, course and start date are required."
    );
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      organizationId,
    },
  });

  if (!branch) {
    throw new Error("Invalid branch.");
  }

  // Make sure the course belongs to this organization
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      organizationId,
    },
  });

  if (!course) {
    throw new Error("Invalid course.");
  }

  // Make sure this course is actually available at this branch
  const branchCourse = await prisma.branchCourse.findUnique({
    where: {
      branchId_courseId: {
        branchId,
        courseId,
      },
    },
  });

  if (!branchCourse) {
    throw new Error(
      "This course is not available at the selected branch."
    );
  }

  const startDate = new Date(startDateValue);

  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid start date.");
  }

  let endDate: Date | null = null;

  if (endDateValue) {
    endDate = new Date(endDateValue);

    if (Number.isNaN(endDate.getTime())) {
      throw new Error("Invalid end date.");
    }

    if (endDate <= startDate) {
      throw new Error("End date must be after start date.");
    }
  }

  let capacity: number | null = null;

  if (capacityValue) {
    capacity = Number(capacityValue);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("Invalid batch capacity.");
    }
  }

  await prisma.batch.create({
    data: {
      name,
      code,
      branchId,
      courseId,
      startDate,
      endDate,
      capacity,
      status: "UPCOMING",
    },
  });

  redirect("/batches");
}