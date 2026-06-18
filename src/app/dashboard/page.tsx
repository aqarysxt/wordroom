"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { Cabinet } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen, Spinner } from "@/components/ui/Spinner";

const TUTORIAL_STEPS = [
  ["1", "Кіру", "Аты-жөніңіз бен 4 сандық кодты енгізіңіз."],
  ["2", "Кабинет", "Жаңа кабинет ашыңыз немесе дайын кодпен кіріңіз."],
  ["3", "Тақырып", "Тақырып ашып, сөздер мен аудармаларын қосыңыз."],
  ["4", "Жаттығу", "Дайын басып, ойын режимдерімен қайталаңыз."],
];

const CABINET_THEMES = [
  {
    card: "gradient-bloody text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
  },
  {
    card: "gradient-sweet text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
  },
  {
    card: "gradient-cactus text-ink-900",
    chip: "bg-white/60 text-ink-900",
    muted: "text-ink-700",
  },
  {
    card: "gradient-quepal text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
  },
  {
    card: "gradient-no-mans text-ink-900",
    chip: "bg-white/50 text-ink-900",
    muted: "text-ink-700",
  },
  {
    card: "gradient-bloody text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
  },
  {
    card: "gradient-sweet text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
  },
];

const STEP_GRADIENTS = [
  "gradient-bloody text-white",
  "gradient-sweet text-white",
  "gradient-cactus text-ink-900",
  "gradient-no-mans text-ink-900",
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const loadCabinets = useCallback(async (userId: string) => {
    try {
      const { cabinets } = await api.getCabinets(userId);
      setCabinets(cabinets);
    } catch {
      // тізім бос болса да бетті көрсетеміз
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    loadCabinets(current.id);
  }, [router, loadCabinets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setCreateError("");
    if (newName.trim().length < 1) {
      setCreateError("Кабинет атауын енгізіңіз.");
      return;
    }
    setCreating(true);
    try {
      const { cabinet } = await api.createCabinet(newName.trim(), user.id);
      router.push(`/cabinet/${cabinet.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Қате болды.");
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setJoinError("");
    if (joinCode.trim().length < 1) {
      setJoinError("Кабинет кодын енгізіңіз.");
      return;
    }
    setJoining(true);
    try {
      const { cabinet } = await api.joinCabinet(joinCode.trim(), user.id);
      router.push(`/cabinet/${cabinet.id}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Кабинет табылмады.");
      setJoining(false);
    }
  }

  function scrollToPanel(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!user) return <LoadingScreen />;

  return (
    <div className="min-h-screen pb-10">
      <TopBar user={user} />

      <main className="app-shell">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="gradient-hero animate-fade-up overflow-hidden rounded-4xl p-6 text-white shadow-glow sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold text-white/70">Қайырлы күн,</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  {user.full_name}
                </h1>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-white/75">
                  Кабинетті таңдаңыз немесе жаңа сөздік бөлмесін ашыңыз.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/20 p-3 backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="text-sm font-bold text-white">Кабинеттер</p>
                  <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-black text-ink-900">
                    {loading ? "..." : cabinets.length}
                  </span>
                </div>
                {loading ? (
                  <div className="rounded-3xl bg-white/90 p-4 text-ink-900">
                    <p className="text-sm font-bold">Кабинеттер жүктеліп жатыр...</p>
                    <p className="mt-1 text-xs font-semibold text-ink-500">Бір сәт күтіңіз.</p>
                  </div>
                ) : cabinets.length > 0 ? (
                  <div className="space-y-2">
                    {cabinets.slice(0, 3).map((cabinet) => (
                      <Link
                        key={cabinet.id}
                        href={`/cabinet/${cabinet.id}`}
                        className="group flex items-center justify-between gap-3 rounded-3xl bg-white/90 p-3 text-ink-900 shadow-card transition hover:-translate-y-0.5 hover:bg-white"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">{cabinet.name}</p>
                          <p className="mt-0.5 font-mono text-xs font-bold tracking-widest text-ink-500">
                            {cabinet.code}
                          </p>
                          <p className="mt-1 text-xs font-bold text-ink-500">
                            {cabinet.member_count ?? 0} адам
                          </p>
                        </div>
                        <span className="shrink-0 rounded-2xl bg-ink-900 px-3 py-2 text-xs font-black text-white transition group-hover:bg-brand-600">
                          Кіру
                        </span>
                      </Link>
                    ))}
                    {cabinets.length > 3 && (
                      <p className="px-2 pt-1 text-xs font-bold text-white/75">
                        Тағы {cabinets.length - 3} кабинет төменде көрсетілген.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white/90 p-4 text-ink-900 shadow-card">
                    <p className="text-sm font-black">Әзірге кабинет жоқ</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-ink-500">
                      Жаңа кабинет ашыңыз немесе код арқылы дайын кабинетке кіріңіз.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button type="button" size="sm" onClick={() => scrollToPanel("create-cabinet")}>
                        Ашу
                      </Button>
                      <Button
                        type="button"
                        variant="surface"
                        size="sm"
                        onClick={() => scrollToPanel("join-cabinet")}
                      >
                        Кіру
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Card className="animate-fade-up p-6 sm:p-7" style={{ animationDelay: "120ms" }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                  Tutorial
                </p>
                <h2 className="mt-1 text-xl font-black text-ink-900">
                  WordRoom қалай жұмыс істейді?
                </h2>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                4 қадам
              </span>
            </div>
            <div className="space-y-4">
              {TUTORIAL_STEPS.map(([step, title, description]) => (
                <div key={step} className="flex gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-soft ${STEP_GRADIENTS[Number(step) - 1]}`}
                  >
                    {step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">{title}</h3>
                    <p className="mt-0.5 text-sm leading-5 text-ink-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <div className="mb-10 grid gap-4 lg:grid-cols-2">
          <Card id="create-cabinet" className="interactive-card animate-fade-up scroll-mt-24 overflow-hidden p-6">
            <div className="mb-5 h-1.5 rounded-full gradient-quepal" />
            <h2 className="mb-1 text-base font-bold text-ink-900">Жаңа кабинет ашу</h2>
            <p className="mb-4 text-sm text-ink-500">Өзіңіздің сөздік кабинетіңізді құрыңыз.</p>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                name="cabinetName"
                placeholder="Кабинет атауы"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              {createError && <Alert tone="error">{createError}</Alert>}
              <Button type="submit" className="w-full" loading={creating}>
                Жаңа кабинет ашу
              </Button>
            </form>
          </Card>

          <Card
            id="join-cabinet"
            className="interactive-card animate-fade-up scroll-mt-24 overflow-hidden p-6"
            style={{ animationDelay: "80ms" }}
          >
            <div className="mb-5 h-1.5 rounded-full gradient-orbit" />
            <h2 className="mb-1 text-base font-bold text-ink-900">Кабинетке кіру</h2>
            <p className="mb-4 text-sm text-ink-500">Сізге берілген 6 таңбалы кодты енгізіңіз.</p>
            <form onSubmit={handleJoin} className="space-y-3">
              <Input
                name="cabinetCode"
                placeholder="Мысалы: A7KQ92"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="uppercase tracking-widest"
                maxLength={6}
              />
              {joinError && <Alert tone="error">{joinError}</Alert>}
              <Button type="submit" variant="secondary" className="w-full" loading={joining}>
                Кабинетке кіру
              </Button>
            </form>
          </Card>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Library
              </p>
              <h2 className="section-title mt-1">Менің кабинеттерім</h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-7 w-7" />
            </div>
          ) : cabinets.length === 0 ? (
            <EmptyState
              icon="🗂️"
              title="Әзірге кабинет жоқ"
              description="Жоғарыдан жаңа кабинет ашыңыз немесе код арқылы кіріңіз."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cabinets.map((cabinet, index) => {
                const theme = CABINET_THEMES[index % CABINET_THEMES.length];
                return (
                <Link key={cabinet.id} href={`/cabinet/${cabinet.id}`}>
                  <article
                    className={`interactive-card animate-pop-in h-full rounded-4xl ${theme.card} p-5 shadow-card`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-3xl text-lg font-black ${theme.chip}`}>
                        W
                      </span>
                      <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold tracking-widest ${theme.chip}`}>
                        {cabinet.code}
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black tracking-tight">{cabinet.name}</h3>
                    <p className={`mt-2 text-sm font-semibold ${theme.muted}`}>
                      {cabinet.member_count ?? 0} адам · Кабинетке өту →
                    </p>
                  </article>
                </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
