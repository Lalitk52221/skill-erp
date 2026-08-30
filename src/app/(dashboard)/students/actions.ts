"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudentStatus } from "@/generated/prisma";
import { EmploymentStatus } from "@/generated/prisma";
import { redirect } from "next/navigation";

export async function createStudent(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  // -----------------------------
  // STUDENT INFORMATION
  // -----------------------------

  const name = formData.get("name")?.toString().trim();

  const studentCode = formData
    .get("studentCode")
    ?.toString()
    .trim()
    .toUpperCase();

  const fatherName = formData.get("fatherName")?.toString().trim() || null;

  const motherName = formData.get("motherName")?.toString().trim() || null;

  const phone = formData.get("phone")?.toString().trim() || null;

  const email = formData.get("email")?.toString().trim() || null;

  const gender = formData.get("gender")?.toString() || null;

  const dateOfBirthValue = formData.get("dateOfBirth")?.toString();

  const aadharNumber = formData.get("aadharNumber")?.toString().trim() || null;

  const address = formData.get("address")?.toString().trim() || null;

  const city = formData.get("city")?.toString().trim() || null;

  const district = formData.get("district")?.toString().trim() || null;

  // -----------------------------
  // ENROLLMENT INFORMATION
  // -----------------------------

  const enrollmentNumber =
    formData.get("enrollmentNumber")?.toString().trim().toUpperCase() || null;

  const yearValue = formData.get("year")?.toString();

  const year = yearValue ? Number(yearValue) : null;

  const sessionName = formData.get("session")?.toString().trim() || null;
  const employmentStatusValue = formData.get("employmentStatus")?.toString();

  const employmentStatus = employmentStatusValue
    ? (employmentStatusValue as EmploymentStatus)
    : null;

  // -----------------------------
  // COURSE / BRANCH / BATCH
  // -----------------------------

  const branchId = formData.get("branchId")?.toString();

  const courseId = formData.get("courseId")?.toString();

  const batchId = formData.get("batchId")?.toString();

  // -----------------------------
  // REQUIRED VALIDATION
  // -----------------------------

  if (!name || !studentCode || !branchId || !courseId || !batchId) {
    throw new Error(
      "Name, student code, branch, course and batch are required.",
    );
  }

  // -----------------------------
  // VALIDATE BRANCH
  // -----------------------------

  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      organizationId,
    },
  });

  if (!branch) {
    throw new Error("Invalid branch.");
  }

  // -----------------------------
  // VALIDATE COURSE
  // -----------------------------

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      organizationId,
    },
  });

  if (!course) {
    throw new Error("Invalid course.");
  }

  // -----------------------------
  // VALIDATE BRANCH + COURSE
  // -----------------------------

  const branchCourse = await prisma.branchCourse.findUnique({
    where: {
      branchId_courseId: {
        branchId,
        courseId,
      },
    },
  });

  if (!branchCourse) {
    throw new Error("This course is not available at the selected branch.");
  }

  // -----------------------------
  // VALIDATE BATCH
  // -----------------------------

  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
      branchId,
      courseId,
    },
  });

  if (!batch) {
    throw new Error("Invalid batch for the selected branch and course.");
  }

  // -----------------------------
  // CHECK STUDENT CODE
  // -----------------------------

  const existingStudent = await prisma.student.findUnique({
    where: {
      organizationId_studentCode: {
        organizationId,
        studentCode,
      },
    },
  });

  if (existingStudent) {
    throw new Error("A student with this student code already exists.");
  }

  // -----------------------------
  // CHECK ENROLLMENT NUMBER
  // -----------------------------

  if (enrollmentNumber) {
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        organizationId,
        enrollmentNumber,
      },
    });

    if (existingEnrollment) {
      throw new Error(
        "An enrollment with this enrollment number already exists.",
      );
    }
  }

  // -----------------------------
  // VALIDATE AADHAAR
  // -----------------------------

  if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
    throw new Error("Aadhaar number must contain exactly 12 digits.");
  }

  // -----------------------------
  // DATE OF BIRTH
  // -----------------------------

  const dateOfBirth = dateOfBirthValue ? new Date(dateOfBirthValue) : null;

  if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) {
    throw new Error("Invalid date of birth.");
  }

  // -----------------------------
  // CREATE STUDENT + ENROLLMENT
  // -----------------------------

  await prisma.$transaction(async (tx) => {
    const student = await tx.student.create({
      data: {
        studentCode,
        name,
        fatherName,
        motherName,
        dateOfBirth,
        gender,
        aadharNumber,
        phone,
        email,
        address,
        city,
        district,
        organizationId,
        branchId,
      },
    });

    await tx.enrollment.create({
      data: {
        studentId: student.id,
        organizationId,
        branchId,
        courseId,
        batchId,
        enrollmentNumber,
        year,
        session: sessionName,
        employmentStatus,
      },
    });
  });

  redirect("/students");
}

export async function updateStudent(
  formData: FormData
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const id = formData.get("id")?.toString();

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

  const aadharNumber =
    formData.get("aadharNumber")?.toString().trim() || null;

  const address =
    formData.get("address")?.toString().trim() || null;

  const city =
    formData.get("city")?.toString().trim() || null;

  const district =
    formData.get("district")?.toString().trim() || null;

const statusValue =
  formData.get("status")?.toString();

const status = statusValue
  ? (statusValue as StudentStatus)
  : undefined;

  if (!id || !name || !studentCode) {
    throw new Error(
      "Student ID, name and student code are required."
    );
  }

  const student = await prisma.student.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  const duplicateStudent =
    await prisma.student.findFirst({
      where: {
        organizationId,
        studentCode,
        NOT: {
          id,
        },
      },
    });

  if (duplicateStudent) {
    throw new Error(
      "A student with this student code already exists."
    );
  }

  const dateOfBirth = dateOfBirthValue
    ? new Date(dateOfBirthValue)
    : null;

  if (
    dateOfBirth &&
    Number.isNaN(dateOfBirth.getTime())
  ) {
    throw new Error("Invalid date of birth.");
  }

  if (
    aadharNumber &&
    !/^\d{12}$/.test(aadharNumber)
  ) {
    throw new Error(
      "Aadhaar number must contain exactly 12 digits."
    );
  }

  await prisma.student.update({
    where: {
      id,
    },
    data: {
      studentCode,
      name,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      aadharNumber,
      phone,
      email,
      address,
      city,
      district,
      status,
    },
  });

  redirect(`/students/${id}`);
}