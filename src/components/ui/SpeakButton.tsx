"use client";

import { cn } from "@/lib/utils";

interface SpeakButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  lang?: string;
}

export function SpeakButton({
  text,
  lang = "en-US",
  className,
  onClick,
  ...props
}: SpeakButtonProps) {
  function speak(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);

    if (typeof window === "undefined") return;

    const browserWindow = window as Window &
      typeof globalThis & { speechSynthesis?: SpeechSynthesis };
    const synth = browserWindow.speechSynthesis;

    if (!synth) {
      browserWindow.alert("Бұл браузер дыбыстауды қолдамайды.");
      return;
    }

    synth.cancel();
    const utterance = new browserWindow.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    synth.speak(utterance);
  }

  return (
    <button
      type="button"
      aria-label={`${text} сөзін тыңдау`}
      title="Тыңдау"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/90 text-base shadow-card transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
        className,
      )}
      onClick={speak}
      {...props}
    >
      🔊
    </button>
  );
}
