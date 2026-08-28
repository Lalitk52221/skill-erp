// import { prisma } from "@/lib/prisma";
// import { auth } from "@/auth";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { createBranch } from "../actions";

// export default async function NewBranchPage() {
//   const session = await auth();

//   if (!session?.user) {
//     redirect("/login");
//   }

//   const states = await prisma.state.findMany({
//     where: {
//       organizationId: session.user.organizationId,
//     },
//     orderBy: {
//       name: "asc",
//     },
//   });

//   return (
//     <div className="max-w-2xl">
//       <div className="mb-6">
//         <Link
//           href="/branches"
//           className="text-sm text-gray-500 hover:text-gray-900"
//         >
//           ← Back to Branches
//         </Link>

//         <h1 className="mt-4 text-2xl font-bold text-gray-900">
//           Add Branch
//         </h1>
//       </div>

//       <form
//         action={createBranch}
//         className="space-y-6 rounded-xl border bg-white p-6"
//       >
//         <div>
//           <label className="mb-2 block text-sm font-medium">
//             Branch Name
//           </label>

//           <input
//             name="name"
//             required
//             placeholder="e.g. Delhi"
//             className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
//           />
//         </div>

//         <div>
//           <label className="mb-2 block text-sm font-medium">
//             Branch Code
//           </label>

//           <input
//             name="code"
//             required
//             placeholder="e.g. DEL"
//             className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
//           />
//         </div>

//         <div>
//           <label className="mb-2 block text-sm font-medium">
//             State
//           </label>

//           <select
//             name="stateId"
//             required
//             className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
//           >
//             <option value="">Select state</option>

//             {states.map((state) => (
//               <option key={state.id} value={state.id}>
//                 {state.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="mb-2 block text-sm font-medium">
//             City
//           </label>

//           <input
//             name="city"
//             placeholder="e.g. Delhi"
//             className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
//           />
//         </div>

//         <div className="flex justify-end gap-3">
//           <Link
//             href="/branches"
//             className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
//           >
//             Cancel
//           </Link>

//           <button
//             type="submit"
//             className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
//           >
//             Create Branch
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createBranch } from "../actions";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Other",
];

export default async function NewBranchPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/branches"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Branches
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add Branch
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new training center or branch.
        </p>
      </div>

      <form
        action={createBranch}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        {/* Branch Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Branch Name
          </label>

          <input
            name="name"
            required
            placeholder="e.g. Delhi"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        {/* Branch Code */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Branch Code
          </label>

          <input
            name="code"
            required
            placeholder="e.g. DEL"
            className="w-full rounded-lg border px-4 py-3 uppercase outline-none focus:border-gray-900"
          />
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Country
          </label>

          <select
            name="country"
            required
            defaultValue="India"
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            State / Union Territory
          </label>

          <select
            name="stateName"
            required
            className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-gray-900"
          >
            <option value="">Select state</option>

            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            City
          </label>

          <input
            name="city"
            placeholder="e.g. Delhi"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        {/* Address */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Address
          </label>

          <textarea
            name="address"
            rows={3}
            placeholder="Branch full address"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone
          </label>

          <input
            name="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href="/branches"
            className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Branch
          </button>
        </div>
      </form>
    </div>
  );
}