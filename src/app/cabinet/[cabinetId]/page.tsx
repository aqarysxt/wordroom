"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { Cabinet, Topic } from "@/lib/types";
import { wordCountLabel } from "@/lib/utils";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/Spinner";

const TOPIC_THEMES = [
  {
    card: "gradient-bloody text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
    soft: "text-white/75",
  },
  {
    card: "gradient-sweet text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
    soft: "text-white/75",
  },
  {
    card: "gradient-cactus text-ink-900",
    chip: "bg-white/60 text-ink-900",
    muted: "text-ink-700",
    soft: "text-ink-700",
  },
  {
    card: "gradient-quepal text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
    soft: "text-white/75",
  },
  {
    card: "gradient-no-mans text-ink-900",
    chip: "bg-white/60 text-ink-900",
    muted: "text-ink-700",
    soft: "text-ink-700",
  },
  {
    card: "gradient-bloody text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
    soft: "text-white/75",
  },
  {
    card: "gradient-sweet text-white",
    chip: "bg-white/85 text-ink-900",
    muted: "text-white/80",
    soft: "text-white/75",
  },
];

export default function CabinetPage() {
  const router = useRouter();
  const params = useParams<{ cabinetId: string }>();
  const cabinetId = params.cabinetId;

  const [user, setUser] = useState<StoredUser | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = useCallback(async () => {
    try {
      const [{ cabinet }, { topics }] = await Promise.all([
        api.getCabinet(cabinetId),
        api.getTopics(cabinetId),
      ]);
      setCabinet(cabinet);
      setTopics(topics);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Кабинетті жүктеу мүмкін болмады.");
    } finally {
      setLoading(false);
    }
  }, [cabinetId]);

  useEffect(() => {
    setOrigin(window.location.origin);
    const current = getCurrentUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    load();
  }, [router, load]);

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (title.trim().length < 1) {
      setCreateError("Тақырып атауын енгізіңіз.");
      return;
    }
    setCreating(true);
    try {
      const { topic } = await api.createTopic(cabinetId, title.trim(), description.trim());
      setTopics((prev) => [topic, ...prev]);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      router.push(`/cabinet/${cabinetId}/topic/${topic.id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Қате болды.");
    } finally {
      setCreating(false);
    }
  }

  if (!user || loading) return <LoadingScreen />;

  if (loadError || !cabinet) {
    return (
      <div className="min-h-screen">
        <TopBar user={user} backHref="/dashboard" backLabel="Басты бет" />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <Alert tone="error">{loadError || "Кабинет табылмады."}</Alert>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="secondary">Басты бетке оралу</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const inviteLink = origin && cabinet ? `${origin}/invite/${encodeURIComponent(cabinet.code)}` : "";

  return (
    <div className="min-h-screen pb-10">
      <TopBar user={user} backHref="/dashboard" backLabel="Басты бет" />

      <main className="app-shell">
        <section className="gradient-hero animate-fade-up mb-8 overflow-hidden rounded-4xl p-6 text-white shadow-glow sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-white/70">Кабинет</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                {cabinet.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-white/70">Кабинет коды</span>
                <span className="rounded-full bg-white/60 px-4 py-2 font-mono text-sm font-bold tracking-widest text-ink-900">
                  {cabinet.code}
                </span>
                <CopyButton value={cabinet.code} />
              </div>
              <div className="mt-5 rounded-[1.75rem] border border-white/30 bg-white/15 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-white/70">Шақыру сілтемесі</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="min-w-0 flex-1 truncate rounded-2xl bg-white/60 px-4 py-2 font-mono text-xs font-bold text-ink-900">
                    {inviteLink || "..."}
                  </p>
                  {inviteLink && (
                    <CopyButton
                      value={inviteLink}
                      label="⧉ Link"
                      copiedLabel="✓ Көшірілді"
                      ariaLabel="Шақыру сілтемесін көшіру"
                      className="justify-center"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="stack-preview scale-75">
                <span className="stack-layer" />
                <span className="stack-layer" />
                <span className="stack-layer" />
                <span className="stack-layer" />
                <span className="stack-layer" />
              </div>
            </div>
            <Button
              variant="surface"
              onClick={() => setModalOpen(true)}
              className="lg:col-span-2 lg:w-fit"
            >
              ＋ Жаңа тақырып ашу
            </Button>
          </div>
        </section>

        {topics.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Әзірге тақырып жоқ"
            description="Жаңа тақырып ашып, оған сөздер қосыңыз."
            action={<Button onClick={() => setModalOpen(true)}>Жаңа тақырып ашу</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, index) => (
              <TopicCard key={topic.id} cabinetId={cabinetId} topic={topic} index={index} />
            ))}
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Жаңа тақырып">
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <Input
            label="Тақырып атауы"
            name="title"
            placeholder="Мысалы: Саяхат сөздері"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            label="Сипаттама (міндетті емес)"
            name="description"
            placeholder="Қысқаша сипаттама"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {createError && <Alert tone="error">{createError}</Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Бас тарту
            </Button>
            <Button type="submit" loading={creating}>
              Құру
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TopicCard({
  cabinetId,
  topic,
  index,
}: {
  cabinetId: string;
  topic: Topic;
  index: number;
}) {
  const count = topic.word_count ?? 0;
  const isReady = topic.status === "ready";
  const theme = TOPIC_THEMES[index % TOPIC_THEMES.length];

  return (
    <article
      className={`interactive-card animate-pop-in flex h-full min-h-72 flex-col rounded-4xl ${theme.card} p-5 shadow-card`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-12 w-12 items-center justify-center rounded-3xl text-lg font-black ${theme.chip}`}>
          W
        </span>
        <span
          className={
            isReady
              ? `rounded-full px-3 py-1 text-xs font-bold ${theme.chip}`
              : `rounded-full px-3 py-1 text-xs font-bold ${theme.chip}`
          }
        >
          {isReady ? "Дайын" : "Жоба"}
        </span>
      </div>
      <h3 className="mt-8 text-2xl font-black tracking-tight">{topic.title}</h3>
      {topic.description && (
        <p className={`mt-2 line-clamp-2 text-sm font-semibold ${theme.soft}`}>
          {topic.description}
        </p>
      )}
      <p className={`mt-3 text-sm font-bold ${theme.muted}`}>{wordCountLabel(count)}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Link href={`/cabinet/${cabinetId}/topic/${topic.id}/edit`} className="flex-1">
          <Button
            variant="surface"
            size="sm"
            className="w-full"
          >
            Сөз қосу
          </Button>
        </Link>
        <Link
          href={isReady ? `/cabinet/${cabinetId}/topic/${topic.id}/practice` : "#"}
          className="flex-1"
          aria-disabled={!isReady}
          onClick={(e) => {
            if (!isReady) e.preventDefault();
          }}
        >
          <Button
            variant="surface"
            size="sm"
            className="w-full"
            disabled={!isReady}
          >
            Дайындық бөлмесі
          </Button>
        </Link>
      </div>
      {!isReady && count < 3 && (
        <p className={`mt-2 text-xs font-semibold ${theme.soft}`}>
          Дайындық үшін кемінде 3 сөз қажет.
        </p>
      )}
    </article>
  );
}
