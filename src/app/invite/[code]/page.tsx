"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  clearPendingInvite,
  getCurrentUser,
  savePendingInvite,
  type StoredUser,
} from "@/lib/currentUser";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/Spinner";

type InviteStatus = "checking" | "needs-login" | "joining" | "success" | "error";

function decodeInviteCode(code: string) {
  try {
    return decodeURIComponent(code).trim().toUpperCase();
  } catch {
    return code.trim().toUpperCase();
  }
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const inviteCode = useMemo(
    () => decodeInviteCode(params.code || ""),
    [params.code],
  );

  const [user, setUser] = useState<StoredUser | null>(null);
  const [status, setStatus] = useState<InviteStatus>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!inviteCode) {
      setStatus("error");
      setMessage("Шақыру сілтемесі дұрыс емес.");
      return;
    }

    const current = getCurrentUser();
    setUser(current);

    if (!current) {
      savePendingInvite(inviteCode);
      setStatus("needs-login");
      setMessage("Алдымен аккаунтқа кіріңіз. Сосын кабинет автоматты қосылады.");
      const timer = window.setTimeout(() => router.replace("/"), 1200);
      return () => window.clearTimeout(timer);
    }

    setStatus("joining");
    setMessage("Кабинетке қосып жатырмыз...");

    api
      .joinCabinet(inviteCode, current.id)
      .then(({ cabinet }) => {
        clearPendingInvite();
        setStatus("success");
        setMessage(`${cabinet.name} кабинетіне қосылдыңыз.`);
        window.setTimeout(() => router.replace(`/cabinet/${cabinet.id}`), 900);
      })
      .catch((err) => {
        clearPendingInvite();
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Кабинетке қосылу мүмкін болмады.");
      });
  }, [inviteCode, router]);

  if (status === "checking" || status === "joining") return <LoadingScreen />;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="app-panel animate-fade-up w-full max-w-md overflow-hidden p-6 sm:p-7">
        <div className="mb-5 h-1.5 rounded-full gradient-quepal" />
        <div className="gradient-hero mb-5 flex h-14 w-14 items-center justify-center rounded-3xl text-xl font-black text-white shadow-soft">
          W
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          Invite
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink-900">
          Кабинетке шақыру
        </h1>
        <p className="mt-2 font-mono text-sm font-bold tracking-widest text-ink-500">
          {inviteCode}
        </p>

        <Alert
          tone={status === "error" ? "error" : status === "success" ? "success" : "info"}
          className="mt-5"
        >
          {message}
        </Alert>

        <div className="mt-5 flex flex-wrap gap-2">
          {status === "needs-login" ? (
            <Link href="/" className="w-full">
              <Button className="w-full">Кіру</Button>
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className="flex-1">
                <Button variant="surface" className="w-full">
                  Басты бет
                </Button>
              </Link>
              {user && status === "error" && (
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  Қайталау
                </Button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
