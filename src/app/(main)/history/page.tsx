import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { HistoryCard } from "@/components/history-card";
import { cn } from "@/lib/utils";
import { HistoryIcon, ScanLineIcon } from "lucide-react";

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
        <PageHeader />
        <div className="rounded-[2rem] border border-dashed border-primary/30 bg-card/75 p-12 text-center shadow-xl shadow-emerald-950/5">
          <p className="text-muted-foreground">还没有扫描记录，去扫描第一个产品吧！</p>
          <Link href="/scan" className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
            去扫描
          </Link>
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
      <PageHeader />

      <div className="inline-flex items-center gap-1 rounded-full border bg-card/75 p-1 shadow-sm">
        {FILTER_VALUES.map((value) => (
          <Link
            key={value}
            href={value === "all" ? "/history" : `/history?filter=${value}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {FILTER_LABELS[value]}
          </Link>
        ))}
      </div>

      {scans.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-primary/30 bg-card/75 p-12 text-center shadow-xl shadow-emerald-950/5">
          <p className="text-muted-foreground">
            {activeFilter === "all"
              ? "还没有扫描记录，去扫描第一个产品吧！"
              : `没有 ${FILTER_LABELS[activeFilter]} 评分的记录`}
          </p>
          {activeFilter === "all" && (
            <Link href="/scan" className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
              去扫描
            </Link>
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

function PageHeader() {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-card/80 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HistoryIcon className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">扫描历史</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            回看每一次食品分析，按健康评分筛选，快速找到更适合长期购买的产品。
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-sm text-primary">
        <ScanLineIcon className="size-4" />
        建议保留常买食品的扫描记录，方便下次购物时对比。
      </div>
    </div>
  );
}
