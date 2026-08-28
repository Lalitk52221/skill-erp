"use client";

import {
  //  useEffect,
  useState,
} from "react";

type Course = {
  id: string;
  name: string;
  code: string;
  durationMonths: number | null;
};

type Branch = {
  id: string;
  name: string;
  stateName: string;
  courses: Course[];
};

type Props = {
  branches: Branch[];
  action: (formData: FormData) => void;
};

export default function BatchForm({ branches, action }: Props) {
  const [selectedBranchId, setSelectedBranchId] = useState("");
  //   const [selectedCourseId, setSelectedCourseId] = useState("");

  //   const [startDate, setStartDate] = useState("");

  //   const [endDate, setEndDate] = useState("");

  const selectedBranch = branches.find(
    (branch) => branch.id === selectedBranchId,
  );

  //   useEffect(() => {
  //     if (!selectedCourseId || !startDate) {
  //       setEndDate("");
  //       return;
  //     }

  //     const course = selectedBranch?.courses.find(
  //       (course) => course.id === selectedCourseId,
  //     );

  //     if (!course?.durationMonths) {
  //       setEndDate("");
  //       return;
  //     }

  //     const date = new Date(startDate);

  //     date.setMonth(date.getMonth() + course.durationMonths);

  //     const formattedDate = date.toISOString().split("T")[0];

  //     setEndDate(formattedDate);
  //   }, [selectedCourseId, startDate, selectedBranch]);

  return (
    <form action={action} className="space-y-6 rounded-xl border bg-white p-6">
      {/* Batch Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">Batch Name</label>

        <input
          name="name"
          required
          placeholder="e.g. Computer Batch April 2026"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
        />
      </div>

      {/* Batch Code */}
      <div>
        <label className="mb-2 block text-sm font-medium">Batch Code</label>

        <input
          name="code"
          required
          placeholder="e.g. COM-APR26"
          className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
        />
      </div>

      {/* Branch */}
      <div>
        <label className="mb-2 block text-sm font-medium">Branch</label>

        <select
          name="branchId"
          required
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
        >
          <option value="">Select branch</option>

          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} — {branch.stateName}
            </option>
          ))}
        </select>
      </div>

      {/* Course */}
      <div>
        <label className="mb-2 block text-sm font-medium">Course</label>

        <select
          name="courseId"
          required
          //   disabled={!selectedBranchId}
          //   value={selectedCourseId}
          //   onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900 disabled:bg-gray-100"
        >
          <option value="">
            {selectedBranchId ? "Select course" : "Select branch first"}
          </option>

          {selectedBranch?.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
              {course.durationMonths
                ? ` — ${course.durationMonths} months`
                : ""}
            </option>
          ))}
        </select>

        {selectedBranch && selectedBranch.courses.length === 0 && (
          <p className="mt-1 text-xs text-red-600">
            No courses are assigned to this branch.
          </p>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label className="mb-2 block text-sm font-medium">Start Date</label>

        <input
          name="startDate"
          type="date"
          required
          //   value={startDate}
          //   onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
        />
      </div>

      {/* End Date */}
      <div>
        <label className="mb-2 block text-sm font-medium">End Date</label>

        <input
          name="endDate"
          type="date"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
        />

        <p className="mt-1 text-xs text-gray-500">
          {/* Optional. We will add automatic calculation next. */}
        </p>
      </div>
      {/* <div>
  <label className="mb-2 block text-sm font-medium">
    End Date
  </label>

  <input
    name="endDate"
    type="date"
    value={endDate}
    readOnly
    className="w-full rounded-lg border bg-gray-50 px-4 py-3 outline-none"
  />

  {selectedCourseId && startDate && endDate && (
    <p className="mt-1 text-xs text-gray-500">
      End date calculated automatically from course duration.
    </p>
  )}
</div> */}

      {/* Capacity */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Student Capacity
        </label>

        <input
          name="capacity"
          type="number"
          min="1"
          placeholder="e.g. 30"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
        />

        <p className="mt-1 text-xs text-gray-500">Optional.</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <a
          href="/batches"
          className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </a>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Batch
        </button>
      </div>
    </form>
  );
}
