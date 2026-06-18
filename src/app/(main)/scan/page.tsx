"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ImageIcon, Loader2Icon, ScanLineIcon, SparklesIcon } from "lucide-react";
import { CameraCapture } from "@/components/camera-capture";
import { ScanResultCard } from "@/components/scan-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ScanResult } from "@/lib/schema";

type ScanState = "capture" | "analyzing" | "result";

export default function ScanPage() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [providers, setProviders] = useState<string[]>([]);
  const [providerLabels, setProviderLabels] = useState<Record<string, string>>({});
  const [defaultProvider, setDefaultProvider] = useState<string>("");
  const [state, setState] = useState<ScanState>("capture");
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [result, setResult] = useState<(ScanResult & { id?: string }) | null>(
    null
  );

  useEffect(() => {
    fetch("/api/scan/providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) {
          setProviders(data.providers);
          if (data.labels) setProviderLabels(data.labels);
          setDefaultProvider(data.default ?? data.providers[0]);
          if (!provider && data.default) {
            setProvider(data.default);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (defaultProvider && !provider) {
      setProvider(defaultProvider);
    }
  }, [defaultProvider, provider]);

  const handleCapture = (base64: string) => {
    setImageBase64(base64);
  };

  const handleClear = () => {
    setImageBase64(null);
  };

  const handleLoadDemo = useCallback(async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch("/demo/sample-label.jpg");
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setLoadingDemo(false);
        toast.success("已加载示例图片");
      };
      reader.onerror = () => {
        setLoadingDemo(false);
        toast.error("加载示例图片失败");
      };
      reader.readAsDataURL(blob);
    } catch {
      setLoadingDemo(false);
      toast.error("加载示例图片失败");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast.error("请先拍摄或上传配料表图片");
      return;
    }

    setState("analyzing");
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          provider: providers.length > 1 ? provider : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "分析失败");
      }

      setResult(data.result);
      setState("result");
    } catch (err) {
      setState("capture");
      toast.error(err instanceof Error ? err.message : "分析失败，请重试");
    }
  };

  const handleScanNew = () => {
    setImageBase64(null);
    setResult(null);
    setState("capture");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card/80 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <ScanLineIcon className="size-4" />
              智能扫描
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              扫描配料表
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              拍摄或上传食品配料表/营养成分表，AI 将提取营养、添加剂和过敏原信息并生成健康评分。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground md:w-64">
            {["上传", "分析", "评分"].map((step, index) => (
              <div key={step} className="rounded-2xl bg-background/70 p-3">
                <div className="mx-auto mb-1 flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {state === "result" && result ? (
        <div className="space-y-4">
          <ScanResultCard result={result} />
          <Button onClick={handleScanNew} className="h-11 w-full rounded-xl shadow-lg shadow-primary/20">
            扫描新产品
          </Button>
        </div>
      ) : state === "analyzing" ? (
        <Card className="border-white/60 bg-card/80 shadow-xl shadow-emerald-950/5 dark:border-white/10">
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
              <Loader2Icon className="relative size-12 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-semibold">AI 正在分析配料表...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                正在识别产品信息、营养数据和潜在风险。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/60 bg-card/80 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10">
          <CardContent className="space-y-6 p-4 md:p-6">
          <CameraCapture
            onCapture={handleCapture}
            onClear={handleClear}
            disabled={false}
          />

          {!imageBase64 && (
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">或者</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {!imageBase64 && (
            <Button
              variant="outline"
              onClick={handleLoadDemo}
              disabled={loadingDemo}
              className="h-11 w-full rounded-xl border-primary/20 bg-background/70"
            >
              {loadingDemo ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <ImageIcon className="mr-2 size-4" />
              )}
              使用示例图片（矿泉水标签）
            </Button>
          )}

          {providers.length > 1 && (
            <div className="space-y-2">
              <Label>AI 分析引擎</Label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background/70 px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/30"
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {providerLabels[p] ?? p}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!imageBase64}
            className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
          >
            <SparklesIcon className="size-4" />
            开始分析
          </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
