import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting database seed...");

  // -----------------------------------
  // 1. ORGANIZATION
  // -----------------------------------

  const organization = await prisma.organization.upsert({
    where: {
      code: "SKILLERP",
    },
    update: {},
    create: {
      name: "SkillERP Demo Organization",
      code: "SKILLERP",
      email: "admin@skillerp.com",
      phone: "9999999999",
    },
  });

  console.log("Organization created:", organization.name);

  // -----------------------------------
  // 2. STATES
  // -----------------------------------

  const haryana = await prisma.state.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "HR",
      },
    },
    update: {},
    create: {
      name: "Haryana",
      code: "HR",
      organizationId: organization.id,
    },
  });

  const uttarPradesh = await prisma.state.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "UP",
      },
    },
    update: {},
    create: {
      name: "Uttar Pradesh",
      code: "UP",
      organizationId: organization.id,
    },
  });

  const uttarakhand = await prisma.state.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "UK",
      },
    },
    update: {},
    create: {
      name: "Uttarakhand",
      code: "UK",
      organizationId: organization.id,
    },
  });

  console.log("States created");

  // -----------------------------------
  // 3. BRANCHES
  // -----------------------------------

  const gurugram = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "GGM",
      },
    },
    update: {},
    create: {
      name: "Gurugram",
      code: "GGM",
      city: "Gurugram",
      stateId: haryana.id,
      organizationId: organization.id,
    },
  });

  const noida = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "NOI",
      },
    },
    update: {},
    create: {
      name: "Noida",
      code: "NOI",
      city: "Noida",
      stateId: uttarPradesh.id,
      organizationId: organization.id,
    },
  });

  const pantnagar1 = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "PN1",
      },
    },
    update: {},
    create: {
      name: "Pantnagar 1",
      code: "PN1",
      city: "Pantnagar",
      stateId: uttarakhand.id,
      organizationId: organization.id,
    },
  });

  const pantnagar2 = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "PN2",
      },
    },
    update: {},
    create: {
      name: "Pantnagar 2",
      code: "PN2",
      city: "Pantnagar",
      stateId: uttarakhand.id,
      organizationId: organization.id,
    },
  });

  console.log("Branches created");

  // -----------------------------------
  // 4. COURSES
  // -----------------------------------

  const computer = await prisma.course.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "COM",
      },
    },
    update: {},
    create: {
      name: "Computer",
      code: "COM",
      durationMonths: 6,
      organizationId: organization.id,
    },
  });

  const english = await prisma.course.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "ENG",
      },
    },
    update: {},
    create: {
      name: "English",
      code: "ENG",
      durationMonths: 3,
      organizationId: organization.id,
    },
  });

  const tally = await prisma.course.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "TAL",
      },
    },
    update: {},
    create: {
      name: "Tally",
      code: "TAL",
      durationMonths: 4,
      organizationId: organization.id,
    },
  });

  const cutting = await prisma.course.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "CUT",
      },
    },
    update: {},
    create: {
      name: "Cutting & Tailoring",
      code: "CUT",
      durationMonths: 6,
      organizationId: organization.id,
    },
  });

  console.log("Courses created");

  // -----------------------------------
  // 5. BRANCH → COURSE
  // -----------------------------------

  const branchCourses = [
    { branchId: gurugram.id, courseId: computer.id },
    { branchId: gurugram.id, courseId: english.id },
    { branchId: gurugram.id, courseId: tally.id },
    { branchId: gurugram.id, courseId: cutting.id },

    { branchId: noida.id, courseId: computer.id },
    { branchId: noida.id, courseId: english.id },
    { branchId: noida.id, courseId: tally.id },

    { branchId: pantnagar1.id, courseId: computer.id },
    { branchId: pantnagar1.id, courseId: english.id },
    { branchId: pantnagar1.id, courseId: tally.id },

    { branchId: pantnagar2.id, courseId: computer.id },
    { branchId: pantnagar2.id, courseId: english.id },
    { branchId: pantnagar2.id, courseId: tally.id },
  ];

  for (const item of branchCourses) {
    await prisma.branchCourse.upsert({
      where: {
        branchId_courseId: item,
      },
      update: {},
      create: item,
    });
  }

  console.log("Branch courses created");

  // -----------------------------------
  // 6. PERMISSIONS
  // -----------------------------------

  const permissionNames = [
    "dashboard.view",
    "students.view",
    "students.create",
    "students.update",
    "students.delete",
    "students.import",
    "students.export",

    "branches.view",
    "branches.create",
    "branches.update",
    "branches.delete",

    "courses.view",
    "courses.create",
    "courses.update",
    "courses.delete",

    "batches.view",
    "batches.create",
    "batches.update",
    "batches.delete",

    "fees.view",
    "fees.create",
    "fees.update",

    "attendance.view",
    "attendance.create",
    "attendance.update",

    "exams.view",
    "exams.create",
    "exams.update",
    "exams.delete",

    "homework.view",
    "homework.create",
    "homework.update",
    "homework.delete",

    "users.view",
    "users.create",
    "users.update",
    "users.delete",

    "reports.view",
    "settings.manage",
  ];

  const permissions: Record<string, string> = {};

  for (const name of permissionNames) {
    const permission = await prisma.permission.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });

    permissions[name] = permission.id;
  }

  console.log("Permissions created");

  // -----------------------------------
  // 7. SUPER ADMIN ROLE
  // -----------------------------------

  const superAdminRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: "Super Admin",
      },
    },
    update: {},
    create: {
      name: "Super Admin",
      organizationId: organization.id,
    },
  });

  // Give Super Admin every permission

  for (const permissionId of Object.values(permissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId,
      },
    });
  }

  console.log("Super Admin role created");

  // -----------------------------------
  // 8. SUPER ADMIN USER
  // -----------------------------------

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("SEED_ADMIN_PASSWORD is not defined");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: "admin@skillerp.com",
      },
    },
    update: {
      passwordHash,
      roleId: superAdminRole.id,
      status: "ACTIVE",
      name: "Super Admin",
    },
    create: {
      name: "Super Admin",
      email: "admin@skillerp.com",
      passwordHash,
      organizationId: organization.id,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  console.log("Super Admin created:", admin.email);

  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
