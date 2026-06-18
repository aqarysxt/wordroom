"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCurrentUser, type StoredUser } from "@/lib/currentUser";

interface TopBarProps {
  user: StoredUser | null;
  backHref?: string;
  backLabel?: string;
}

export function TopBar({ user, backHref, backLabel }: TopBarProps) {
  const router = useRouter();

  function logout() {
    clearCurrentUser();
    router.push("/");
  }

  return (
    <header className="animate-fade-up sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/80 bg-white/80 px-3 py-2 shadow-card backdrop-blur-xl sm:px-4">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-white hover:text-ink-900"
            >
              <span className="text-lg leading-none">‹</span>
              {backLabel || "Артқа"}
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="gradient-hero flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black text-white shadow-soft">
                W
              </span>
              <span className="text-lg font-black tracking-tight text-ink-900">WordRoom</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden max-w-52 truncate text-sm font-semibold text-ink-500 sm:inline">
              {user.full_name}
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-white hover:text-ink-900"
          >
            Шығу
          </button>
        </div>
      </div>
    </header>
  );
}
