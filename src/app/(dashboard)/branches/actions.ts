// "use server";

// import { auth } from "@/auth";
// import { prisma } from "@/lib/prisma";
// import { redirect } from "next/navigation";

// export async function createBranch(formData: FormData) {
//   const session = await auth();

//   if (!session?.user) {
//     redirect("/login");
//   }

//   const name = formData.get("name")?.toString().trim();
//   const code = formData.get("code")?.toString().trim().toUpperCase();
//   const city = formData.get("city")?.toString().trim();
//   const stateId = formData.get("stateId")?.toString();

//   if (!name || !code || !stateId) {
//     throw new Error("Name, code and state are required.");
//   }

//   const state = await prisma.state.findFirst({
//     where: {
//       id: stateId,
//       organizationId: session.user.organizationId,
//     },
//   });

//   if (!state) {
//     throw new Error("Invalid state.");
//   }

//   await prisma.branch.create({
//     data: {
//       name,
//       code,
//       city: city || null,
//       stateId,
//       organizationId: session.user.organizationId,
//     },
//   });

//   redirect("/branches");
// }
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const indianStateCodes: Record<string, string> = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chhattisgarh: "CG",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  Odisha: "OD",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Telangana: "TS",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UK",
  "West Bengal": "WB",

  "Andaman and Nicobar Islands": "AN",
  Chandigarh: "CH",
  "Dadra and Nagar Haveli and Daman and Diu": "DH",
  Delhi: "DL",
  "Jammu and Kashmir": "JK",
  Ladakh: "LA",
  Lakshadweep: "LD",
  Puducherry: "PY",
};

export async function createBranch(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const name = formData.get("name")?.toString().trim();
  const code = formData.get("code")?.toString().trim().toUpperCase();
  const country = formData.get("country")?.toString().trim();
  const stateName = formData.get("stateName")?.toString().trim();
  const city = formData.get("city")?.toString().trim();
  const address = formData.get("address")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();

  if (!name || !code || !country || !stateName) {
    throw new Error(
      "Branch name, code, country and state are required."
    );
  }

  // Currently supporting India
  if (country !== "India") {
    throw new Error("Currently only India is supported.");
  }

  const stateCode = indianStateCodes[stateName];

  if (!stateCode) {
    throw new Error("Invalid Indian state.");
  }

  // Find state for this organization.
  // If it doesn't exist, create it automatically.
  const state = await prisma.state.upsert({
    where: {
      organizationId_code: {
        organizationId,
        code: stateCode,
      },
    },
    update: {},
    create: {
      name: stateName,
      code: stateCode,
      organizationId,
    },
  });

  // Create branch
  await prisma.branch.create({
    data: {
      name,
      code,
      city: city || null,
      address: address || null,
      phone: phone || null,
      stateId: state.id,
      organizationId,
    },
  });

  redirect("/branches");
}