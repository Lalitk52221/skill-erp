"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createExam(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const name = formData.get("name")?.toString().trim();
  const examType = formData.get("examType")?.toString() || "THEORY";
  const examDateValue = formData.get("examDate")?.toString();

  const maxMarksValue = formData.get("maxMarks")?.toString();
  const passingMarksValue =
    formData.get("passingMarks")?.toString();

  const status =
    formData.get("status")?.toString() || "DRAFT";

  const branchId = formData.get("branchId")?.toString();
  const courseId = formData.get("courseId")?.toString();
  const batchId = formData.get("batchId")?.toString();

  if (
    !name ||
    !examDateValue ||
    !maxMarksValue ||
    !passingMarksValue ||
    !branchId ||
    !courseId ||
    !batchId
  ) {
    throw new Error(
      "Name, exam date, marks, branch, course and batch are required."
    );
  }

  const maxMarks = Number(maxMarksValue);
  const passingMarks = Number(passingMarksValue);

  if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
    throw new Error("Maximum marks must be greater than 0.");
  }

  if (
    !Number.isFinite(passingMarks) ||
    passingMarks < 0
  ) {
    throw new Error("Passing marks are invalid.");
  }

  if (passingMarks > maxMarks) {
    throw new Error(
      "Passing marks cannot be greater than maximum marks."
    );
  }

  const examDate = new Date(examDateValue);

  if (Number.isNaN(examDate.getTime())) {
    throw new Error("Invalid exam date.");
  }

  // Validate branch
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      organizationId,
    },
  });

  if (!branch) {
    throw new Error("Invalid branch.");
  }

  // Validate course
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      organizationId,
    },
  });

  if (!course) {
    throw new Error("Invalid course.");
  }

  // Validate batch belongs to selected branch + course
  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
      branchId,
      courseId,
    },
  });

  if (!batch) {
    throw new Error(
      "Invalid batch for the selected branch and course."
    );
  }

  await prisma.exam.create({
    data: {
      name,
      examType,
      examDate,
      maxMarks,
      passingMarks,
      status: status as "DRAFT" | "SCHEDULED" | "COMPLETED" | "RESULTS_PUBLISHED",
      organizationId,
      branchId,
      courseId,
      batchId,
    },
  });

  redirect("/exams");
}