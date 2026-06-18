import { cn } from "@/lib/utils";

type HealthScore = "A" | "B" | "C" | "D";
type BadgeSize = "sm" | "md" | "lg";

const scoreColors: Record<HealthScore, string> = {
  A: "bg-emerald-500/15 text-emerald-700 shadow-emerald-500/10 dark:text-emerald-300 border-emerald-500/25",
  B: "bg-teal-500/15 text-teal-700 shadow-teal-500/10 dark:text-teal-300 border-teal-500/25",
  C: "bg-amber-500/15 text-amber-700 shadow-amber-500/10 dark:text-amber-300 border-amber-500/25",
  D: "bg-red-500/15 text-red-700 shadow-red-500/10 dark:text-red-300 border-red-500/25",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-16 text-2xl",
};

interface HealthScoreBadgeProps {
  score: HealthScore;
  size?: BadgeSize;
  className?: string;
}

export function HealthScoreBadge({ score, size = "md", className }: HealthScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border font-bold shadow-lg",
        scoreColors[score],
        sizeClasses[size],
        className
      )}
    >
      {score}
    </span>
  );
}
