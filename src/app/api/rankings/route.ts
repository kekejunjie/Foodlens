import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "community";
  const category = searchParams.get("category");

  if (type === "personal") {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ data: [] });
    }

    const grouped = await prisma.scan.groupBy({
      by: ["productId"],
      where: {
        userId: dbUser.id,
        productId: { not: null },
        ...(category && {
          product: { category: category },
        }),
      },
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
        userId: dbUser.id,
        productId: { in: productIds },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["productId"],
    });
    const scoreByProduct = Object.fromEntries(
      latestScans.map((s) => [s.productId!, s.healthScore])
    );

    const data = sorted.map((item, index) => {
      const product = productMap[item.productId!];
      const score = (scoreByProduct[item.productId!] ?? "C") as "A" | "B" | "C" | "D";
      return {
        rank: index + 1,
        productId: item.productId,
        productName: product?.name ?? "未知产品",
        brand: product?.brand ?? null,
        category: product?.category ?? null,
        scanCount: item._count.id,
        healthScore: score,
      };
    });

    return NextResponse.json({ data });
  }

  if (type === "community") {
    const scans = await prisma.scan.findMany({
      where: {
        productId: { not: null },
        ...(category && {
          product: { category: category },
        }),
      },
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

    const data = ranked.map((item, index) => {
      const product = productMap[item.productId];
      return {
        rank: index + 1,
        productId: item.productId,
        productName: product?.name ?? "未知产品",
        brand: product?.brand ?? null,
        category: product?.category ?? null,
        scanCount: item.scanCount,
        avgHealthScore: roundToScore(item.avgScore),
      };
    });

    return NextResponse.json({ data });
  }

  return NextResponse.json(
    { error: "无效的 type 参数，请使用 personal 或 community" },
    { status: 400 }
  );
}
