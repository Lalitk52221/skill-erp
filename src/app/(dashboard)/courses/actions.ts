"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const name = formData.get("name")?.toString().trim();
  const code = formData.get("code")?.toString().trim().toUpperCase();
  const description =
    formData.get("description")?.toString().trim();
  const durationMonthsValue = formData
    .get("durationMonths")
    ?.toString();

  const branchIds = formData.getAll("branchIds");

  if (!name || !code) {
    throw new Error("Course name and code are required.");
  }

  const durationMonths = durationMonthsValue
    ? Number(durationMonthsValue)
    : null;

  if (
    durationMonths !== null &&
    (!Number.isInteger(durationMonths) || durationMonths <= 0)
  ) {
    throw new Error("Invalid course duration.");
  }

  // Make sure selected branches belong to this organization
  const validBranches = await prisma.branch.findMany({
    where: {
      id: {
        in: branchIds.map(String),
      },
      organizationId,
    },
    select: {
      id: true,
    },
  });

  const validBranchIds = validBranches.map(
    (branch) => branch.id
  );

  const course = await prisma.course.create({
    data: {
      name,
      code,
      description: description || null,
      durationMonths,
      organizationId,
    },
  });

  if (validBranchIds.length > 0) {
    await prisma.branchCourse.createMany({
      data: validBranchIds.map((branchId) => ({
        branchId,
        courseId: course.id,
      })),
      skipDuplicates: true,
    });
  }

  redirect("/courses");
}