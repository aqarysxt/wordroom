"use client";

import { useMemo, useState } from "react";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

export function FlipCardMode({ words, onFinish, onExit }: ModeProps) {
  const deck = useMemo(() => shuffle(words), [words]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];

  function answer(knew: boolean) {
    const nextCorrect = correct + (knew ? 1 : 0);
    const nextWrong = wrong + (knew ? 0 : 1);
    setCorrect(nextCorrect);
    setWrong(nextWrong);

    if (index + 1 >= deck.length) {
      setDone(true);
      onFinish(nextCorrect, nextWrong);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function restart() {
    setIndex(0);
    setFlipped(false);
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

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="flip-card block h-72 w-full"
        aria-label="Картаны аудару"
      >
        <div className={cn("flip-card-inner", flipped && "is-flipped")}>
          <div className="flip-card-face gradient-toxic flex flex-col items-center justify-center rounded-4xl border border-white/80 p-6 shadow-card">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-700">Сөз</span>
            <span className="mt-2 flex items-center gap-3 text-3xl font-black text-ink-900">
              {current.word}
              <SpeakButton text={current.word} />
            </span>
            <span className="mt-6 text-xs font-semibold text-ink-500">Аудару үшін басыңыз</span>
          </div>
          <div className="flip-card-face flip-card-back flex flex-col items-center justify-center rounded-4xl border border-white/80 bg-white p-6 text-center shadow-card">
            <span className="text-2xl font-black text-brand-700">{current.translation}</span>
            {current.meaning && (
              <span className="mt-3 text-sm font-medium text-ink-500">{current.meaning}</span>
            )}
            {current.example_sentence && (
              <span className="mt-2 text-sm italic text-slate-400">
                “{current.example_sentence}”
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => answer(false)}>
          Қайталау керек
        </Button>
        <Button onClick={() => answer(true)}>Білдім</Button>
      </div>
    </div>
  );
}
