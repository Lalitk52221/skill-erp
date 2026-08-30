"use client";

import Link from "next/link";

type Student = {
  id: string;
  studentCode: string;
  name: string;
  fatherName: string | null;
  motherName: string | null;
  dateOfBirth: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  status: string;
};

type Props = {
  student: Student;
  action: (formData: FormData) => void;
};

export default function StudentEditForm({
  student,
  action,
}: Props) {
  return (
    <form
      action={action}
      className="space-y-8 rounded-xl border bg-white p-6"
    >
      <input
        type="hidden"
        name="studentId"
        value={student.id}
      />

      {/* PERSONAL INFORMATION */}

      <div>
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Personal Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Student Code
            </label>

            <input
              name="studentCode"
              required
              defaultValue={student.studentCode}
              className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Student Name
            </label>

            <input
              name="name"
              required
              defaultValue={student.name}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Father&apos;s Name
            </label>

            <input
              name="fatherName"
              defaultValue={student.fatherName ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Mother&apos;s Name
            </label>

            <input
              name="motherName"
              defaultValue={student.motherName ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Date of Birth
            </label>

            <input
              name="dateOfBirth"
              type="date"
              defaultValue={student.dateOfBirth}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Gender
            </label>

            <select
              name="gender"
              defaultValue={student.gender ?? ""}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTACT INFORMATION */}

      <div>
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Contact Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone
            </label>

            <input
              name="phone"
              type="tel"
              defaultValue={student.phone ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              name="email"
              type="email"
              defaultValue={student.email ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Address
            </label>

            <textarea
              name="address"
              rows={3}
              defaultValue={student.address ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              City
            </label>

            <input
              name="city"
              defaultValue={student.city ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              District
            </label>

            <input
              name="district"
              defaultValue={student.district ?? ""}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>

      {/* STATUS */}

      <div>
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Student Status
        </h2>

        <div className="max-w-md">
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            name="status"
            defaultValue={student.status}
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* BUTTONS */}

      <div className="flex justify-end gap-3 border-t pt-6">
        <Link
          href={`/students/${student.id}`}
          className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}