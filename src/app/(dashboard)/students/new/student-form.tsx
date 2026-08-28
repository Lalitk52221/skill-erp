"use client";

import Link from "next/link";
import { useState } from "react";

type Course = {
  id: string;
  name: string;
  code: string;
  durationMonths: number | null;
};

type Batch = {
  id: string;
  name: string;
  code: string;
  courseId: string;
  startDate: string;
  endDate: string | null;
  status: string;
};

type Branch = {
  id: string;
  name: string;
  stateName: string;
  courses: Course[];
  batches: Batch[];
};

type Props = {
  branches: Branch[];
  action: (formData: FormData) => void;
};

export default function StudentForm({
  branches,
  action,
}: Props) {
  const [selectedBranchId, setSelectedBranchId] =
    useState("");

  const [selectedCourseId, setSelectedCourseId] =
    useState("");

  const selectedBranch = branches.find(
    (branch) => branch.id === selectedBranchId
  );

  const availableCourses =
    selectedBranch?.courses ?? [];

  const availableBatches =
    selectedBranch?.batches.filter(
      (batch) =>
        batch.courseId === selectedCourseId
    ) ?? [];

  return (
    <form
      action={action}
      className="space-y-8 rounded-xl border bg-white p-6"
    >
      {/* PERSONAL INFORMATION */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
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
              placeholder="e.g. STU-0001"
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
              placeholder="Full name"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Father&apos;s Name
            </label>

            <input
              name="fatherName"
              placeholder="Father's name"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Mother&apos;s Name
            </label>

            <input
              name="motherName"
              placeholder="Mother's name"
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
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Gender
            </label>

            <select
              name="gender"
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
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
              placeholder="Phone number"
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
              placeholder="Email address"
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
              placeholder="Full address"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              City
            </label>

            <input
              name="city"
              placeholder="City"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              District
            </label>

            <input
              name="district"
              placeholder="District"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>

      {/* ENROLLMENT */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Enrollment
        </h2>

        <div className="space-y-5">
          {/* BRANCH */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Branch
            </label>

            <select
              name="branchId"
              required
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setSelectedCourseId("");
              }}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
            >
              <option value="">
                Select branch
              </option>

              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name} — {branch.stateName}
                </option>
              ))}
            </select>
          </div>

          {/* COURSE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Course
            </label>

            <select
              name="courseId"
              required
              disabled={!selectedBranchId}
              value={selectedCourseId}
              onChange={(e) =>
                setSelectedCourseId(e.target.value)
              }
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900 disabled:bg-gray-100"
            >
              <option value="">
                {selectedBranchId
                  ? "Select course"
                  : "Select branch first"}
              </option>

              {availableCourses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.name}
                  {course.durationMonths
                    ? ` — ${course.durationMonths} months`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* BATCH */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Batch
            </label>

            <select
              name="batchId"
              required
              disabled={!selectedCourseId}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900 disabled:bg-gray-100"
            >
              <option value="">
                {selectedCourseId
                  ? "Select batch"
                  : "Select course first"}
              </option>

              {availableBatches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.id}
                >
                  {batch.name} ({batch.code}) —{" "}
                  {batch.status}
                </option>
              ))}
            </select>

            {selectedCourseId &&
              availableBatches.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  No batches available for this course.
                </p>
              )}
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Link
          href="/students"
          className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Student
        </button>
      </div>
    </form>
  );
}