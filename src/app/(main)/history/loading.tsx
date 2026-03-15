import { Card, CardHeader, CardContent } from "@/components/ui/card";

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <div className="h-6 w-8 rounded-md bg-muted animate-pulse shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-[75%] rounded bg-muted animate-pulse" />
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-[60%] rounded bg-muted animate-pulse" />
          <div className="h-3 w-[30%] rounded bg-muted animate-pulse" />
        </div>
      </CardHeader>
    </Card>
  );
}

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-12 rounded-md bg-muted/80 animate-pulse" />
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
