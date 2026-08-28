"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createStudent(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const name = formData.get("name")?.toString().trim();
  const studentCode = formData
    .get("studentCode")
    ?.toString()
    .trim()
    .toUpperCase();

  const fatherName =
    formData.get("fatherName")?.toString().trim() || null;

  const motherName =
    formData.get("motherName")?.toString().trim() || null;

  const phone =
    formData.get("phone")?.toString().trim() || null;

  const email =
    formData.get("email")?.toString().trim() || null;

  const gender =
    formData.get("gender")?.toString() || null;

  const dateOfBirthValue =
    formData.get("dateOfBirth")?.toString();

  const address =
    formData.get("address")?.toString().trim() || null;

  const city =
    formData.get("city")?.toString().trim() || null;

  const district =
    formData.get("district")?.toString().trim() || null;

  const branchId = formData.get("branchId")?.toString();
  const courseId = formData.get("courseId")?.toString();
  const batchId = formData.get("batchId")?.toString();

  if (
    !name ||
    !studentCode ||
    !branchId ||
    !courseId ||
    !batchId
  ) {
    throw new Error(
      "Name, student code, branch, course and batch are required."
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

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      organizationId,
    },
  });

  if (!course) {
    throw new Error("Invalid course.");
  }

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

  const existingStudent = await prisma.student.findUnique({
    where: {
      organizationId_studentCode: {
        organizationId,
        studentCode,
      },
    },
  });

  if (existingStudent) {
    throw new Error(
      "A student with this student code already exists."
    );
  }

  const dateOfBirth = dateOfBirthValue
    ? new Date(dateOfBirthValue)
    : null;

  const student = await prisma.student.create({
    data: {
      studentCode,
      name,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      city,
      district,
      organizationId,
      branchId,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      organizationId,
      branchId,
      courseId,
      batchId,
    },
  });

  redirect("/students");
}