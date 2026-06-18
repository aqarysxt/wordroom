import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-white/80 bg-white/90 p-5 shadow-card backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
