"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createState(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const name = formData.get("name")?.toString().trim();
  const code = formData.get("code")?.toString().trim().toUpperCase();

  if (!name || !code) {
    throw new Error("State name and code are required.");
  }

  await prisma.state.create({
    data: {
      name,
      code,
      organizationId: session.user.organizationId,
    },
  });

  redirect("/states");
}