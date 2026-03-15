"use client";

import type { ScanResult } from "@/lib/schema";
import { HealthScoreBadge } from "@/components/health-score-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ScanResultCardProps {
  result: ScanResult & { id?: string };
}

const NUTRITION_LABELS: Record<
  string,
  { label: string; unit: string; max?: number }
> = {
  sugar: { label: "糖", unit: "g/100g", max: 15 },
  sodium: { label: "钠", unit: "mg/100g", max: 600 },
  fat: { label: "脂肪", unit: "g/100g", max: 20 },
  protein: { label: "蛋白质", unit: "g/100g", max: 25 },
  calories: { label: "热量", unit: "kcal/100g", max: 400 },
};

function NutritionBar({
  value,
  max = 100,
  label,
  unit,
}: {
  value: number;
  max?: number;
  label: string;
  unit: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const isHigh = percentage > 80;
  const isMedium = percentage > 50 && percentage <= 80;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isHigh && "bg-red-500",
            isMedium && "bg-amber-500",
            !isHigh && !isMedium && "bg-emerald-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ScanResultCard({ result }: ScanResultCardProps) {
  const nutritionEntries = [
    result.sugar != null && { key: "sugar", value: result.sugar },
    result.sodium != null && { key: "sodium", value: result.sodium },
    result.fat != null && { key: "fat", value: result.fat },
    result.protein != null && { key: "protein", value: result.protein },
    result.calories != null && { key: "calories", value: result.calories },
  ].filter(Boolean) as { key: keyof typeof NUTRITION_LABELS; value: number }[];

  const highRiskSet = new Set(result.highRiskAdditives ?? []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <HealthScoreBadge score={result.healthScore} size="lg" />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">
              {result.productName}
              {result.brand && (
                <span className="ml-2 font-normal text-muted-foreground">
                  {result.brand}
                </span>
              )}
            </CardTitle>
            {result.category && (
              <Badge variant="secondary" className="mt-1.5">
                {result.category}
              </Badge>
            )}
          </div>
        </div>
        {result.summary && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {result.summary}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {nutritionEntries.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 text-sm font-medium">营养成分</h4>
              <div className="space-y-3">
                {nutritionEntries.map(({ key, value }) => {
                  const config = NUTRITION_LABELS[key];
                  if (!config) return null;
                  return (
                    <NutritionBar
                      key={key}
                      value={value}
                      max={config.max}
                      label={config.label}
                      unit={config.unit}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {result.additives && result.additives.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-sm font-medium">食品添加剂</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.additives.map((additive) => (
                  <Badge
                    key={additive}
                    variant={highRiskSet.has(additive) ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {additive}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {result.allergens && result.allergens.length > 0 && (
          <>
            <Separator />
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
              <h4 className="mb-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
                过敏原提示
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {result.allergens.join("、")}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
