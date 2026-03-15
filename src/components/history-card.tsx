"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { HealthScoreBadge } from "@/components/health-score-badge";
import { formatRelativeTime } from "@/lib/date";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { Scan, Product } from "@/generated/prisma";

type ScanWithProduct = Scan & { product: Product | null };

interface HistoryCardProps {
  scan: ScanWithProduct;
}

function formatNutrition(value: number | null | undefined, unit: string): string {
  if (value == null) return "-";
  return `${value} ${unit}`;
}

export function HistoryCard({ scan }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const additives = (scan.additives as string[]) ?? [];
  const highRiskAdditives = (scan.highRiskAdditives as string[] | null) ?? [];
  const allergens = (scan.allergens as string[] | null) ?? [];

  const productName = scan.product?.name ?? "未知产品";
  const productBrand = scan.product?.brand;
  const displayName = productBrand ? `${productName} · ${productBrand}` : productName;

  const score = scan.healthScore as "A" | "B" | "C" | "D";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          <HealthScoreBadge score={score} size="md" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-medium truncate">
              {displayName}
            </CardTitle>
            {scan.summary && (
              <CardDescription className="mt-1 line-clamp-2">
                {scan.summary}
              </CardDescription>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {formatRelativeTime(scan.createdAt)}
            </p>
          </div>
          <div className="shrink-0">
            {expanded ? (
              <ChevronUpIcon className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="border-t pt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">营养成分 (每100g)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>热量: {formatNutrition(scan.calories, "kcal")}</span>
              <span>蛋白质: {formatNutrition(scan.protein, "g")}</span>
              <span>脂肪: {formatNutrition(scan.fat, "g")}</span>
              <span>糖: {formatNutrition(scan.sugar, "g")}</span>
              <span>钠: {formatNutrition(scan.sodium, "mg")}</span>
            </div>
          </div>

          {additives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">添加剂</h4>
              <p className="text-sm text-muted-foreground">
                {additives.join("、")}
              </p>
            </div>
          )}

          {highRiskAdditives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
                高风险添加剂
              </h4>
              <p className="text-sm text-muted-foreground">
                {highRiskAdditives.join("、")}
              </p>
            </div>
          )}

          {allergens.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">过敏原</h4>
              <p className="text-sm text-muted-foreground">
                {allergens.join("、")}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
