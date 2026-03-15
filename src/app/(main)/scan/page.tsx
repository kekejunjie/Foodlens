"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2Icon, ImageIcon } from "lucide-react";
import { CameraCapture } from "@/components/camera-capture";
import { ScanResultCard } from "@/components/scan-result-card";
import { Button } from "@/components/ui/button";
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
      <div>
        <h1 className="text-2xl font-bold">扫描配料表</h1>
        <p className="mt-1 text-muted-foreground">
          拍摄或上传食品配料表/营养成分表，AI 将为您分析健康评分
        </p>
      </div>

      {state === "result" && result ? (
        <div className="space-y-4">
          <ScanResultCard result={result} />
          <Button onClick={handleScanNew} className="w-full">
            扫描新产品
          </Button>
        </div>
      ) : state === "analyzing" ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2Icon className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">AI 正在分析配料表...</p>
        </div>
      ) : (
        <div className="space-y-6">
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
              className="w-full"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
            className="w-full"
          >
            开始分析
          </Button>
        </div>
      )}
    </div>
  );
}
