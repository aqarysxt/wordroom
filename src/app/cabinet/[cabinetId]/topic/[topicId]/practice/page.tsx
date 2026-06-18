"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { PracticeMode, Topic, Word } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/Spinner";
import { FlipCardMode } from "@/components/practice/FlipCardMode";
import { MatchingMode } from "@/components/practice/MatchingMode";
import { MeaningMode } from "@/components/practice/MeaningMode";
import { TranslationMode } from "@/components/practice/TranslationMode";

interface ModeMeta {
  key: PracticeMode;
  title: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
  descriptionColor: string;
}

const MODES: ModeMeta[] = [
  {
    key: "flip",
    title: "Flip Card",
    description: "Картаны аударып, есте сақта.",
    icon: "🃏",
    color: "gradient-sweet",
    textColor: "text-white",
    descriptionColor: "text-white/80",
  },
  {
    key: "matching",
    title: "Сәйкестендіру",
    description: "Сөз бен аударманы қос.",
    icon: "🔗",
    color: "gradient-cactus",
    textColor: "text-ink-900",
    descriptionColor: "text-ink-700",
  },
  {
    key: "meaning",
    title: "Мағынасын тап",
    description: "Дұрыс аударманы таңда.",
    icon: "🎯",
    color: "gradient-quepal",
    textColor: "text-white",
    descriptionColor: "text-white/80",
  },
  {
    key: "translation",
    title: "Аудармасын жаз",
    description: "Аударманы өзің жаз.",
    icon: "⌨️",
    color: "gradient-no-mans",
    textColor: "text-ink-900",
    descriptionColor: "text-ink-700",
  },
];

const MODE_LABEL: Record<PracticeMode, string> = MODES.reduce(
  (acc, m) => ({ ...acc, [m.key]: m.title }),
  {} as Record<PracticeMode, string>,
);

export default function PracticePage() {
  const router = useRouter();
  const params = useParams<{ cabinetId: string; topicId: string }>();
  const { cabinetId, topicId } = params;

  const [user, setUser] = useState<StoredUser | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeMode, setActiveMode] = useState<PracticeMode | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);

  const load = useCallback(async () => {
    try {
      const [{ topic }, { words }] = await Promise.all([
        api.getTopic(topicId),
        api.getWords(topicId),
      ]);
      setTopic(topic);
      setWords(words);
    } catch {
      // қате жағдайда төмендегі тексеру арқылы хабар көрсетіледі
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    load();
  }, [router, load]);

  const handleFinish = useCallback(
    (mode: PracticeMode) => (correct: number, wrong: number) => {
      setTotalCorrect((c) => c + correct);
      setTotalWrong((w) => w + wrong);
      if (user) {
        api
          .savePracticeResult({
            userId: user.id,
            topicId,
            mode,
            correctCount: correct,
            wrongCount: wrong,
          })
          .catch(() => {
            /* нәтиже сақталмаса да жаттығу жалғаса береді */
          });
      }
    },
    [user, topicId],
  );

  if (!user || loading) return <LoadingScreen />;

  if (!topic) {
    return (
      <div className="min-h-screen">
        <TopBar user={user} backHref={`/cabinet/${cabinetId}`} backLabel="Кабинет" />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <Alert tone="error">Тақырып табылмады.</Alert>
          <div className="mt-4">
            <Link href={`/cabinet/${cabinetId}`}>
              <Button>Кабинетке оралу</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (words.length < 3 || topic.status !== "ready") {
    const message =
      words.length < 3
        ? "Бұл тақырыпта дайындық бөлмесін ашуға жеткілікті сөз жоқ (кемінде 3 сөз қажет)."
        : "Дайындық бөлмесіне кіру үшін алдымен тақырыпты «Дайын» деп белгілеңіз.";

    return (
      <div className="min-h-screen">
        <TopBar user={user} backHref={`/cabinet/${cabinetId}`} backLabel="Кабинет" />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <Alert tone="error">{message}</Alert>
          <div className="mt-4">
            <Link href={`/cabinet/${cabinetId}/topic/${topicId}/edit`}>
              <Button>Сөз қосуға өту</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const exitToModes = () => setActiveMode(null);

  function renderMode() {
    const props = {
      words,
      onFinish: handleFinish(activeMode as PracticeMode),
      onExit: exitToModes,
    };
    switch (activeMode) {
      case "flip":
        return <FlipCardMode {...props} />;
      case "matching":
        return <MatchingMode {...props} />;
      case "meaning":
        return <MeaningMode {...props} />;
      case "translation":
        return <TranslationMode {...props} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar user={user} backHref={`/cabinet/${cabinetId}`} backLabel="Кабинет" />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="gradient-celestial animate-fade-up mb-6 rounded-4xl p-6 text-white shadow-glow sm:p-8">
          <p className="text-sm font-semibold text-white/70">Дайындық бөлмесі</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{topic.title}</h1>
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/80">
            Режимді таңдап, сөздерді қысқа жаттығулармен бекітіңіз.
          </p>
        </section>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <Card className="interactive-card animate-pop-in overflow-hidden p-4 text-center">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full gradient-orbit" />
            <p className="text-2xl font-black text-ink-900">{words.length}</p>
            <p className="text-xs font-semibold text-ink-500">Барлық сөз</p>
          </Card>
          <Card className="interactive-card animate-pop-in overflow-hidden p-4 text-center" style={{ animationDelay: "70ms" }}>
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full gradient-quepal" />
            <p className="text-2xl font-black text-mint-600">{totalCorrect}</p>
            <p className="text-xs font-semibold text-ink-500">Дұрыс</p>
          </Card>
          <Card className="interactive-card animate-pop-in overflow-hidden p-4 text-center" style={{ animationDelay: "140ms" }}>
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full gradient-bloody" />
            <p className="text-2xl font-black text-coral-600">{totalWrong}</p>
            <p className="text-xs font-semibold text-ink-500">Қате</p>
          </Card>
        </div>

        {activeMode ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">{MODE_LABEL[activeMode]}</h2>
              <Button variant="ghost" size="sm" onClick={exitToModes}>
                ← Режимдер
              </Button>
            </div>
            <Card className="p-5 sm:p-6">{renderMode()}</Card>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {MODES.map((mode, index) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setActiveMode(mode.key)}
                className="text-left"
              >
                <article
                  className={`interactive-card animate-pop-in h-full rounded-4xl ${mode.color} ${mode.textColor} p-5 shadow-card`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-xl">
                      {mode.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{mode.title}</h3>
                      <p className={`mt-1 text-sm font-semibold leading-5 ${mode.descriptionColor}`}>
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </article>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
