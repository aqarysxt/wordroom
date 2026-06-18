"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getCurrentUser, saveCurrentUser } from "@/lib/currentUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/Spinner";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [fullName, setFullName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // localStorage-те қолданушы болса — бірден dashboard-қа
  useEffect(() => {
    if (getCurrentUser()) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 2) {
      setError("Аты-жөніңізді толық енгізіңіз.");
      return;
    }
    if (!/^\d{4}$/.test(accessCode)) {
      setError("4 сандық код енгізіңіз.");
      return;
    }
    if (accessCode !== confirmCode) {
      setError("Екі код бірдей болуы керек.");
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await api.createUser(fullName.trim(), accessCode);
      saveCurrentUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Қате болды.");
      setSubmitting(false);
    }
  }

  if (checking) return <LoadingScreen />;

  return (
    <main className="min-h-screen overflow-hidden px-4 py-8 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden lg:block">
          <div className="animate-fade-up relative mx-auto max-w-lg rounded-[2.75rem] border border-white/80 bg-white/80 p-8 shadow-float backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-black tracking-tight text-ink-900">WordRoom</span>
              <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">
                Learn
              </span>
            </div>
            <div className="stack-preview mt-6">
              <span className="stack-layer" />
              <span className="stack-layer" />
              <span className="stack-layer" />
              <span className="stack-layer" />
              <span className="stack-layer" />
            </div>
            <div className="mt-8 grid grid-cols-5 gap-2">
              {["#9B5DE5", "#F15BB5", "#FEE440", "#00BBF9", "#00F5D4"].map((color) => (
                <span
                  key={color}
                  className="h-3 rounded-full shadow-card"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="animate-fade-up mx-auto w-full max-w-md">
          <div className="mb-6">
            <div className="gradient-hero mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-black text-white shadow-soft">
              W
            </div>
            <p className="text-sm font-semibold text-ink-500">Қайырлы күн,</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-ink-900">WordRoom</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-500">
              Сөздерді тақырып бойынша жинап, ойын режимдері арқылы жылдам жаттаңыз.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="app-panel animate-pop-in space-y-4 overflow-hidden p-6">
            <div className="h-1.5 rounded-full gradient-bloody" />
          <Input
            label="Аты-жөніңіз"
            name="fullName"
            placeholder="Мысалы: Айбек Серіков"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
            autoComplete="name"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="4 сандық код"
              name="accessCode"
              placeholder="1234"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              className="text-center tracking-[0.35em]"
            />
            <Input
              label="Кодты қайталаңыз"
              name="confirmCode"
              placeholder="1234"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              className="text-center tracking-[0.35em]"
            />
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Кіру
          </Button>

          <p className="text-center text-xs text-slate-400">
            Сол аты-жөніңіз бен 4 сандық кодты енгізсеңіз, бұрынғы аккаунт ашылады.
          </p>
          </form>
        </section>
      </div>
    </main>
  );
}
