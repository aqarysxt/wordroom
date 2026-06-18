"use client";

import { useMemo, useState } from "react";
import { cn, normalizeAnswer, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

export function TranslationMode({ words, onFinish, onExit }: ModeProps) {
  const deck = useMemo(() => shuffle(words), [words]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;
    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(current.translation);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setResult("correct");
    } else {
      setWrong((w) => w + 1);
      setResult("wrong");
    }
  }

  function next() {
    if (index + 1 >= deck.length) {
      setDone(true);
      onFinish(correct, wrong);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setResult(null);
  }

  function restart() {
    setIndex(0);
    setAnswer("");
    setResult(null);
    setCorrect(0);
    setWrong(0);
    setDone(false);
  }

  if (done) {
    return <ModeComplete correct={correct} wrong={wrong} onRestart={restart} onExit={onExit} />;
  }

  return (
    <div>
      <ProgressBar current={index} total={deck.length} />

      <div className="gradient-no-mans mb-6 rounded-4xl border border-white/80 p-6 text-center shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-700">
          Аудармасын жазыңыз
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <p className="text-2xl font-black text-ink-900">{current.word}</p>
          <SpeakButton text={current.word} />
        </div>
      </div>

      <form onSubmit={check} className="space-y-4">
        <Input
          name="answer"
          placeholder="Аудармасын енгізіңіз"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!result}
          autoFocus
          autoComplete="off"
        />

        {result && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-semibold",
              result === "correct"
                ? "border-mint-500/20 bg-mint-50 text-mint-600"
                : "border-coral-500/20 bg-coral-50 text-coral-600",
            )}
          >
            {result === "correct" ? "Дұрыс!" : `Қате. Дұрыс жауабы: ${current.translation}`}
          </div>
        )}

        {!result ? (
          <Button type="submit" className="w-full">
            Тексеру
          </Button>
        ) : (
          <Button type="button" className="w-full" onClick={next}>
            {index + 1 >= deck.length ? "Аяқтау" : "Келесі"}
          </Button>
        )}
      </form>
    </div>
  );
}
