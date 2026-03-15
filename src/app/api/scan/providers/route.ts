import { NextResponse } from "next/server";
import {
  getAvailableProviders,
  getDefaultProvider,
} from "@/lib/ai";

export async function GET() {
  try {
    const providers = getAvailableProviders();
    const defaultProvider = providers.length > 0 ? getDefaultProvider() : "";

    return NextResponse.json({
      providers: providers as string[],
      default: defaultProvider,
    });
  } catch (error) {
    console.error("[scan/providers] Error:", error);
    return NextResponse.json(
      { error: "无法获取 AI 服务提供商", providers: [], default: "" },
      { status: 200 }
    );
  }
}
