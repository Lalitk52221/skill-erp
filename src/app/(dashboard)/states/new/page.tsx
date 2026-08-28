import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createState } from "../actions";

export default async function NewStatePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/states"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to States
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add State
        </h1>
      </div>

      <form
        action={createState}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            State Name
          </label>

          <input
            name="name"
            required
            placeholder="e.g. Rajasthan"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            State Code
          </label>

          <input
            name="code"
            required
            maxLength={5}
            placeholder="e.g. RJ"
            className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/states"
            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create State
          </button>
        </div>
      </form>
    </div>
  );
}