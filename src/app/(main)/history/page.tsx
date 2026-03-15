import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { HistoryCard } from "@/components/history-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTER_VALUES = ["all", "A", "B", "C", "D"] as const;
const FILTER_LABELS: Record<(typeof FILTER_VALUES)[number], string> = {
  all: "全部",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?redirect=/history");
  }

  const { filter } = await searchParams;
  const activeFilter = filter && FILTER_VALUES.includes(filter as (typeof FILTER_VALUES)[number])
    ? (filter as (typeof FILTER_VALUES)[number])
    : "all";

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">扫描历史</h1>
        <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">还没有扫描记录，去扫描第一个产品吧！</p>
          <Link href="/scan" className={cn(buttonVariants(), "mt-4")}>去扫描</Link>
        </div>
      </div>
    );
  }

  const scans = await prisma.scan.findMany({
    where: {
      userId: dbUser.id,
      ...(activeFilter !== "all" && { healthScore: activeFilter }),
    },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">扫描历史</h1>

      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        {FILTER_VALUES.map((value) => (
          <Link
            key={value}
            href={value === "all" ? "/history" : `/history?filter=${value}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeFilter === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {FILTER_LABELS[value]}
          </Link>
        ))}
      </div>

      {scans.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">
            {activeFilter === "all"
              ? "还没有扫描记录，去扫描第一个产品吧！"
              : `没有 ${FILTER_LABELS[activeFilter]} 评分的记录`}
          </p>
          {activeFilter === "all" && (
            <Link href="/scan" className={cn(buttonVariants(), "mt-4")}>去扫描</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <HistoryCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  );
}
