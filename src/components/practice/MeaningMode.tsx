"use client";

import { useMemo, useState } from "react";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { buildOptions, ModeComplete, ModeProps, ProgressBar } from "./shared";

export function MeaningMode({ words, onFinish, onExit }: ModeProps) {
  const deck = useMemo(() => shuffle(words), [words]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>(() => buildOptions(words, deck[0]));
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    const isCorrect = option === current.translation;
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
  }

  function next() {
    const finalCorrect = correct;
    const finalWrong = wrong;
    if (index + 1 >= deck.length) {
      setDone(true);
      onFinish(finalCorrect, finalWrong);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setOptions(buildOptions(words, deck[nextIndex]));
    setPicked(null);
  }

  function restart() {
    setIndex(0);
    setOptions(buildOptions(words, deck[0]));
    setPicked(null);
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
          Бұл сөздің аудармасы қайсы?
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <p className="text-2xl font-black text-ink-900">{current.word}</p>
          <SpeakButton text={current.word} />
        </div>
        {current.meaning && <p className="mt-1 text-sm font-medium text-ink-500">{current.meaning}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isCorrectOption = option === current.translation;
          const isPicked = picked === option;
          return (
            <button
              key={option}
              type="button"
              disabled={!!picked}
              onClick={() => choose(option)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-card transition",
                !picked && "border-white/80 bg-white text-ink-700 hover:border-brand-300",
                picked && isCorrectOption && "border-mint-500/30 bg-mint-50 text-mint-600",
                picked && isPicked && !isCorrectOption && "border-coral-500/30 bg-coral-50 text-coral-600",
                picked && !isPicked && !isCorrectOption && "border-white/80 bg-white text-slate-400",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-6 flex items-center justify-between">
          <span
            className={cn(
              "text-sm font-medium",
              picked === current.translation ? "text-mint-600" : "text-coral-600",
            )}
          >
            {picked === current.translation
              ? "Дұрыс!"
              : `Қате. Дұрыс жауабы: ${current.translation}`}
          </span>
          <Button onClick={next}>{index + 1 >= deck.length ? "Аяқтау" : "Келесі"}</Button>
        </div>
      )}
    </div>
  );
}
