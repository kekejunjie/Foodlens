import { Card, CardHeader } from "@/components/ui/card";

function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-white/60 bg-card/85 shadow-lg shadow-emerald-950/5">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <div className="size-9 shrink-0 animate-pulse rounded-2xl bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-[75%] animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-[60%] animate-pulse rounded bg-muted" />
          <div className="h-3 w-[30%] animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
    </Card>
  );
}

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      <div className="h-32 rounded-[2rem] border border-white/60 bg-card/80 shadow-xl shadow-emerald-950/5">
        <div className="h-full animate-pulse rounded-[2rem] bg-muted/50" />
      </div>
      <div className="inline-flex gap-1 rounded-full border bg-card/75 p-1 shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-12 animate-pulse rounded-full bg-muted/80" />
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
