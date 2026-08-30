"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createExamQuestion(
  examId: string,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const question = formData.get("question")?.toString().trim();
  const optionA = formData.get("optionA")?.toString().trim();
  const optionB = formData.get("optionB")?.toString().trim();
  const optionC = formData.get("optionC")?.toString().trim();
  const optionD = formData.get("optionD")?.toString().trim();
  const correctAnswer = formData
    .get("correctAnswer")
    ?.toString();

  const marksValue = formData.get("marks")?.toString();

  if (
    !question ||
    !optionA ||
    !optionB ||
    !optionC ||
    !optionD ||
    !correctAnswer
  ) {
    throw new Error("All question fields are required.");
  }

  const marks = Number(marksValue || "1");

  if (!Number.isFinite(marks) || marks <= 0) {
    throw new Error("Marks must be greater than 0.");
  }

  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      organizationId,
    },
  });

  if (!exam) {
    throw new Error("Exam not found.");
  }

  if (exam.examType !== "MCQ") {
    throw new Error(
      "Questions can only be added to an MCQ exam."
    );
  }

  await prisma.examQuestion.create({
    data: {
      examId,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      marks,
    },
  });

  redirect(`/exams/${examId}/questions`);
}

export async function deleteExamQuestion(
  questionId: string,
  examId: string
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const question = await prisma.examQuestion.findFirst({
    where: {
      id: questionId,
      examId,
      exam: {
        organizationId,
      },
    },
  });

  if (!question) {
    throw new Error("Question not found.");
  }

  await prisma.examQuestion.delete({
    where: {
      id: questionId,
    },
  });

  redirect(`/exams/${examId}/questions`);
}