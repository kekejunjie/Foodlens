function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-card/85 p-4 shadow-lg shadow-emerald-950/5">
      <div className="size-10 shrink-0 animate-pulse rounded-2xl bg-muted" />
      <div className="size-7 animate-pulse rounded-2xl bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-[60%] animate-pulse rounded bg-muted" />
        <div className="h-3 w-[40%] animate-pulse rounded bg-muted" />
      </div>
      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function RankingLoading() {
  return (
    <div className="space-y-6">
      <div className="h-32 rounded-[2rem] border border-white/60 bg-card/80 shadow-xl shadow-emerald-950/5">
        <div className="h-full animate-pulse rounded-[2rem] bg-muted/50" />
      </div>
      <div className="inline-flex gap-1 rounded-full border bg-card/75 p-1 shadow-sm">
        <div className="h-9 w-24 animate-pulse rounded-full bg-muted/80" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-muted/80" />
      </div>
      <div className="space-y-3">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    </div>
  );
}
