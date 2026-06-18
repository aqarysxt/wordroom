import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, string> = {
  error: "border-coral-500/20 bg-coral-50 text-coral-600",
  success: "border-mint-500/20 bg-mint-50 text-mint-600",
  info: "border-brand-500/20 bg-brand-50 text-brand-700",
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm font-medium", tones[tone], className)} role="alert">
      {children}
    </div>
  );
}
