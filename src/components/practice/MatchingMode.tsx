"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/lib/types";
import { cn, shuffle } from "@/lib/utils";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

interface Item {
  id: string;
  text: string;
}

export function MatchingMode({ words, onFinish, onExit }: ModeProps) {
  // Сәйкестендіруді басқарылатын ету үшін ең көбі 8 жұп
  const pairs = useMemo(() => shuffle(words).slice(0, Math.min(words.length, 8)), [words]);

  const [leftItems, setLeftItems] = useState<Item[]>(() =>
    shuffle(pairs.map((w) => ({ id: w.id, text: w.word }))),
  );
  const [rightItems, setRightItems] = useState<Item[]>(() =>
    shuffle(pairs.map((w) => ({ id: w.id, text: w.translation }))),
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  function tryMatch(left: string, right: string) {
    if (left === right) {
      const nextMatched = new Set(matched).add(left);
      const nextCorrect = correct + 1;
      setMatched(nextMatched);
      setCorrect(nextCorrect);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (nextMatched.size === pairs.length) {
        setDone(true);
        onFinish(nextCorrect, wrong);
      }
    } else {
      setWrong((w) => w + 1);
      setWrongPair({ left, right });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 600);
    }
  }

  function pickLeft(id: string) {
    if (matched.has(id) || wrongPair) return;
    setSelectedLeft(id);
    if (selectedRight) tryMatch(id, selectedRight);
  }

  function pickRight(id: string) {
    if (matched.has(id) || wrongPair) return;
    setSelectedRight(id);
    if (selectedLeft) tryMatch(selectedLeft, id);
  }

  function restart() {
    setLeftItems(shuffle(pairs.map((w) => ({ id: w.id, text: w.word }))));
    setRightItems(shuffle(pairs.map((w) => ({ id: w.id, text: w.translation }))));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatched(new Set());
    setWrongPair(null);
    setCorrect(0);
    setWrong(0);
    setDone(false);
  }

  if (done) {
    return <ModeComplete correct={correct} wrong={wrong} onRestart={restart} onExit={onExit} />;
  }

  function cellClass(id: string, selected: boolean, side: "left" | "right") {
    const isMatched = matched.has(id);
    const isWrong =
      wrongPair && ((side === "left" && wrongPair.left === id) || (side === "right" && wrongPair.right === id));
    return cn(
      "flex min-h-[3.75rem] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-card transition",
      isMatched && "cursor-default border-mint-500/20 bg-mint-50 text-mint-600 opacity-60",
      !isMatched && isWrong && "border-coral-500/30 bg-coral-50 text-coral-600",
      !isMatched && !isWrong && selected && "border-brand-500 bg-brand-50 text-brand-700",
      !isMatched && !isWrong && !selected && "border-white/80 bg-white text-ink-700 hover:border-brand-200",
    );
  }

  function handleLeftKeyDown(e: React.KeyboardEvent<HTMLDivElement>, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pickLeft(id);
    }
  }

  return (
    <div>
      <ProgressBar current={matched.size} total={pairs.length} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={matched.has(item.id) ? -1 : 0}
              aria-disabled={matched.has(item.id)}
              onClick={() => pickLeft(item.id)}
              onKeyDown={(e) => handleLeftKeyDown(e, item.id)}
              className={cellClass(item.id, selectedLeft === item.id, "left")}
            >
              <span className="min-w-0 leading-5">{item.text}</span>
              <SpeakButton text={item.text} className="h-8 w-8" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matched.has(item.id)}
              onClick={() => pickRight(item.id)}
              className={cellClass(item.id, selectedRight === item.id, "right")}
            >
              <span className="min-w-0 leading-5">{item.text}</span>
              <span className="h-8 w-8 shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
