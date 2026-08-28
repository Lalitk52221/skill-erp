"use client";

import { signOut } from "next-auth/react";

type HeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <p className="text-sm font-medium text-gray-900">
          {user.name}
        </p>

        <p className="text-xs text-gray-500">
          {user.role}
        </p>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Sign Out
      </button>
    </header>
  );
}