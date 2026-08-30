"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPinned,
  BookOpen,
  Layers3,
  GraduationCap,
  IndianRupee,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  // LogOut,
  Moon,
  Sun,
  UserCog,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
  },
  {
    name: "Branches",
    href: "/branches",
    icon: Building2,
  },
  {
    name: "States",
    href: "/states",
    icon: MapPinned,
  },
  {
    name: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    name: "Batches",
    href: "/batches",
    icon: Layers3,
  },
  {
    name: "Fees",
    href: "/fees",
    icon: IndianRupee,
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    name: "Exams",
    href: "/exams",
    icon: GraduationCap,
  },
  {
    name: "Homework",
    href: "/homework",
    icon: FileText,
  },
  {
    name: "Staff & Users",
    href: "/users",
    icon: UserCog,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((value) => !value);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
            S
          </div>

          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              Skill ERP
            </div>

            <div className="text-[10px] text-gray-500">
              Training Management
            </div>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-60
          flex flex-col
          border-r
          bg-white
          shadow-xl
          transition-all duration-300 ease-in-out
          dark:border-gray-800
          dark:bg-gray-950
          ${collapsed ? "w-19" : "w-64"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* LOGO */}
        <div
          className={`
            flex h-20 items-center border-b
            dark:border-gray-800
            ${collapsed ? "justify-center px-3" : "justify-between px-5"}
          `}
        >
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-gray-900">
              S
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="whitespace-nowrap text-lg font-bold text-gray-900 dark:text-white">
                  Skill ERP
                </h1>

                <p className="whitespace-nowrap text-[10px] text-gray-500">
                  Training Center Management
                </p>
              </div>
            )}
          </Link>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Main Menu
            </p>
          )}

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.name : undefined}
                  className={`
                    group relative flex items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      collapsed
                        ? "justify-center"
                        : ""
                    }
                    ${
                      active
                        ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  {/* ACTIVE INDICATOR */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white dark:bg-gray-900" />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={active ? 2.4 : 2}
                    className={`
                      shrink-0
                      transition-transform duration-200
                      group-hover:scale-110
                    `}
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* BOTTOM CONTROLS */}
        <div className="border-t p-3 dark:border-gray-800">
          {/* DARK MODE */}
          <button
            onClick={toggleDarkMode}
            title={collapsed ? "Toggle theme" : undefined}
            className={`
              mb-1 flex w-full items-center gap-3 rounded-xl
              px-3 py-2.5 text-sm font-medium
              text-gray-600
              transition
              hover:bg-gray-100 hover:text-gray-900
              dark:text-gray-400
              dark:hover:bg-gray-900 dark:hover:text-white
              ${collapsed ? "justify-center" : ""}
            `}
          >
            {darkMode ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}

            {!collapsed && (
              <span>
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          {/* PROFILE */}
          <div
            className={`
              mt-2 flex items-center rounded-xl
              bg-gray-50 p-2
              dark:bg-gray-900
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              SA
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  Super Admin
                </p>

                <p className="truncate text-[10px] text-gray-500">
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border bg-white text-gray-500 shadow-sm transition hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white lg:flex"
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}
        </button>
      </aside>
    </>
  );
}