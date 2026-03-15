"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon, UploadIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 1024;
const JPEG_QUALITY = 0.8;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        readFileAsBase64(file).then(resolve);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      resolve(dataUrl.split(",")[1] ?? dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      readFileAsBase64(file).then(resolve);
    };

    img.src = url;
  });
}

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export function CameraCapture({
  onCapture,
  onClear,
  disabled = false,
  className,
}: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || disabled) return;

      setIsProcessing(true);
      try {
        const base64 = await compressImage(file);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        onCapture(base64);
      } catch (err) {
        console.error("Image compression failed:", err);
      } finally {
        setIsProcessing(false);
        e.target.value = "";
      }
    },
    [onCapture, disabled]
  );

  const handleRetake = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    fileInputRef.current?.click();
  }, [preview]);

  const handleReset = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
      onClear?.();
    }
  }, [preview, onClear]);

  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={isMobile ? "environment" : undefined}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative space-y-3">
          <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30">
            <img
              src={preview}
              alt="预览"
              className="w-full object-contain max-h-64"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetake}
              disabled={disabled || isProcessing}
            >
              <CameraIcon className="size-4" />
              重新拍照
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
            >
              <XIcon className="size-4" />
              清除
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled && !isProcessing) fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/") && !disabled && !isProcessing) {
              const dt = new DataTransfer();
              dt.items.add(file);
              if (fileInputRef.current) {
                fileInputRef.current.files = dt.files;
                fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
          }}
          aria-disabled={disabled || isProcessing}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-12 transition-colors cursor-pointer",
            "hover:border-muted-foreground/50 hover:bg-muted/30",
            "disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {isMobile ? (
            <CameraIcon className="size-12 text-muted-foreground" />
          ) : (
            <UploadIcon className="size-12 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isMobile ? "点击拍照" : "点击或拖拽上传图片"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMobile ? "拍摄配料表或营养成分表" : "支持 JPG、PNG 等格式"}
            </p>
          </div>
          {isProcessing && (
            <p className="text-xs text-muted-foreground">处理中...</p>
          )}
        </div>
      )}
    </div>
  );
}
