import { NextResponse } from "next/server";
import {
  getAvailableProviders,
  getDefaultProvider,
  getProviderLabel,
} from "@/lib/ai";

export async function GET() {
  try {
    const providers = getAvailableProviders();
    const defaultProvider = providers.length > 0 ? getDefaultProvider() : "";

    return NextResponse.json({
      providers: providers as string[],
      labels: Object.fromEntries(providers.map((p) => [p, getProviderLabel(p)])),
      default: defaultProvider,
    });
  } catch (error) {
    console.error("[scan/providers] Error:", error);
    return NextResponse.json(
      { error: "无法获取 AI 服务提供商", providers: [], labels: {}, default: "" },
      { status: 200 }
    );
  }
}
