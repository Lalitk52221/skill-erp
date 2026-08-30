import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { updateStudent } from "../../actions";
import StudentEditForm from "./student-edit-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStudentPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const student = await prisma.student.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Student
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update student information.
        </p>
      </div>

      <StudentEditForm
        student={{
          id: student.id,
          studentCode: student.studentCode,
          name: student.name,
          fatherName: student.fatherName,
          motherName: student.motherName,
          dateOfBirth: student.dateOfBirth
            ? student.dateOfBirth
                .toISOString()
                .split("T")[0]
            : "",
          gender: student.gender,
          phone: student.phone,
          email: student.email,
          address: student.address,
          city: student.city,
          district: student.district,
          status: student.status,
        }}
        action={updateStudent}
      />
    </div>
  );
}