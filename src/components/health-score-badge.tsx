import { cn } from "@/lib/utils";

type HealthScore = "A" | "B" | "C" | "D";
type BadgeSize = "sm" | "md" | "lg";

const scoreColors: Record<HealthScore, string> = {
  A: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  B: "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30",
  C: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  D: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-xs px-1.5 py-0",
  md: "text-sm px-2 py-0.5",
  lg: "text-base px-2.5 py-1",
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
        "inline-flex items-center justify-center rounded-md border font-semibold",
        scoreColors[score],
        sizeClasses[size],
        className
      )}
    >
      {score}
    </span>
  );
}
