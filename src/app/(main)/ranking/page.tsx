import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { HealthScoreBadge } from "@/components/health-score-badge";
import { cn } from "@/lib/utils";

type TabValue = "personal" | "community";

const SCORE_TO_NUM: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
const NUM_TO_SCORE: Record<number, "A" | "B" | "C" | "D"> = {
  4: "A",
  3: "B",
  2: "C",
  1: "D",
};

function roundToScore(avg: number): "A" | "B" | "C" | "D" {
  const rounded = Math.round(avg);
  return NUM_TO_SCORE[Math.max(1, Math.min(4, rounded))] ?? "C";
}

async function getPersonalRankings(userId: string) {
  const grouped = await prisma.scan.groupBy({
    by: ["productId"],
    where: { userId, productId: { not: null } },
    _count: { id: true },
  });

  const sorted = grouped
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 10);

  const productIds = sorted.map((s) => s.productId!).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const latestScans = await prisma.scan.findMany({
    where: {
      userId,
      productId: { in: productIds },
    },
    orderBy: { createdAt: "desc" },
    distinct: ["productId"],
  });
  const scoreByProduct = Object.fromEntries(
    latestScans.map((s) => [s.productId!, s.healthScore as "A" | "B" | "C" | "D"])
  );

  return sorted.map((item, index) => {
    const product = productMap[item.productId!];
    const score = scoreByProduct[item.productId!] ?? "C";
    return {
      rank: index + 1,
      productName: product?.name ?? "未知产品",
      brand: product?.brand ?? null,
      scanCount: item._count.id,
      healthScore: score,
    };
  });
}

async function getCommunityRankings() {
  const scans = await prisma.scan.findMany({
    where: { productId: { not: null } },
    select: { productId: true, healthScore: true },
  });

  const byProduct = new Map<
    string,
    { scores: number[]; count: number }
  >();
  for (const s of scans) {
    const pid = s.productId!;
    const num = SCORE_TO_NUM[s.healthScore] ?? 2;
    const existing = byProduct.get(pid) ?? { scores: [], count: 0 };
    existing.scores.push(num);
    existing.count += 1;
    byProduct.set(pid, existing);
  }

  const ranked = Array.from(byProduct.entries())
    .map(([productId, { scores, count }]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { productId, avgScore: avg, scanCount: count };
    })
    .sort((a, b) => {
      if (Math.abs(a.avgScore - b.avgScore) < 0.1) {
        return b.scanCount - a.scanCount;
      }
      return b.avgScore - a.avgScore;
    })
    .slice(0, 10);

  const productIds = ranked.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return ranked.map((item, index) => {
    const product = productMap[item.productId];
    return {
      rank: index + 1,
      productName: product?.name ?? "未知产品",
      brand: product?.brand ?? null,
      scanCount: item.scanCount,
      avgHealthScore: roundToScore(item.avgScore),
    };
  });
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab: TabValue =
    tab === "community" ? "community" : "personal";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let personalRankings: Awaited<ReturnType<typeof getPersonalRankings>> = [];
  let communityRankings: Awaited<ReturnType<typeof getCommunityRankings>> = [];

  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (dbUser) {
      personalRankings = await getPersonalRankings(dbUser.id);
    }
  } else if (activeTab === "personal") {
    redirect("/login?redirect=/ranking");
  }

  communityRankings = await getCommunityRankings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">健康食品排行</h1>

      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        <Link
          href="/ranking"
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "personal"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          我的排行
        </Link>
        <Link
          href="/ranking?tab=community"
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "community"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          社区排行
        </Link>
      </div>

      {activeTab === "personal" && (
        <div className="space-y-4">
          {personalRankings.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
              <p className="text-muted-foreground">
                还没有扫描记录，去扫描产品查看你的排行吧！
              </p>
              <Link
                href="/scan"
                className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                去扫描
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {personalRankings.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {item.rank}
                  </span>
                  <HealthScoreBadge score={item.healthScore} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.brand && (
                      <p className="text-sm text-muted-foreground">
                        {item.brand}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    扫描 {item.scanCount} 次
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "community" && (
        <div className="space-y-4">
          {communityRankings.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
              <p className="text-muted-foreground">
                社区暂无排行数据，快来扫描第一个产品吧！
              </p>
              <Link
                href="/scan"
                className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                去扫描
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {communityRankings.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {item.rank}
                  </span>
                  <HealthScoreBadge score={item.avgHealthScore} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.brand && (
                      <p className="text-sm text-muted-foreground">
                        {item.brand}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    共 {item.scanCount} 次扫描
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
