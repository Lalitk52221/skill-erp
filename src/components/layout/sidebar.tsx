"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  // {
  //   name: "States",
  //   href: "/states",
  // },
  {
    name: "Branches",
    href: "/branches",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Batches",
    href: "/batches",
  },
  {
    name: "Students",
    href: "/students",
  },
  {
    name: "Fees",
    href: "/fees",
  },
  {
    name: "Attendance",
    href: "/attendance",
  },
  {
    name: "Exams",
    href: "/exams",
  },
  {
    name: "Homework",
    href: "/homework",
  },
  {
    name: "Staff",
    href: "/staff",
  },
  {
    name: "Reports",
    href: "/reports",
  },
  {
    name: "Settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-5">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold text-gray-900">Skill ERP</h1>

            <p className="text-xs text-gray-500">Training Center Management</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
