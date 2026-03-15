import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { getModel } from "@/lib/ai";
import type { AIProvider } from "@/lib/ai";
import { scanResultSchema, type ScanResult } from "@/lib/schema";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import sharp from "sharp";

const MAX_IMAGE_WIDTH = 1280;

async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    const img = sharp(buffer);
    const meta = await img.metadata();
    if (meta.format === "heif") {
      return buffer;
    }
    const pipeline = meta.width && meta.width > MAX_IMAGE_WIDTH
      ? img.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      : img;
    return await pipeline.jpeg({ quality: 85 }).toBuffer();
  } catch {
    return buffer;
  }
}

const MOCK_RESULTS: ScanResult[] = [
  {
    productName: "可口可乐",
    brand: "Coca-Cola",
    category: "饮料",
    healthScore: "D",
    sugar: 10.6,
    sodium: 4,
    fat: 0,
    protein: 0,
    calories: 43,
    additives: ["焦糖色", "磷酸", "咖啡因", "二氧化碳"],
    highRiskAdditives: ["焦糖色（可能含4-MEI）"],
    allergens: [],
    summary:
      "高糖碳酸饮料，每100ml含10.6g糖，长期大量饮用可能增加肥胖和龋齿风险。含焦糖色素和磷酸等添加剂。",
  },
  {
    productName: "农夫山泉茶π蜜桃乌龙",
    brand: "农夫山泉",
    category: "饮料",
    healthScore: "C",
    sugar: 4.5,
    sodium: 20,
    fat: 0,
    protein: 0,
    calories: 19,
    additives: ["柠檬酸", "柠檬酸钠", "维生素C", "食用香精"],
    highRiskAdditives: [],
    allergens: [],
    summary:
      "含糖量中等的调味茶饮料，添加剂较少且风险较低，但仍含有4.5g/100ml的糖分，建议适量饮用。",
  },
  {
    productName: "乐事薯片原味",
    brand: "乐事",
    category: "零食",
    healthScore: "C",
    sugar: 1.2,
    sodium: 500,
    fat: 33,
    protein: 6.5,
    calories: 540,
    additives: ["谷氨酸钠", "5'-呈味核苷酸二钠", "食用香精"],
    highRiskAdditives: [],
    allergens: ["含麸质谷物"],
    summary:
      "高脂高钠零食，每100g含33g脂肪和500mg钠。添加剂种类较少，但高热量高钠是主要健康隐患，建议少量食用。",
  },
];

const scanRequestBodySchema = z.object({
  imageBase64: z.string().min(1, "图片数据不能为空"),
  provider: z.string().optional(),
});

function getMockResult(): ScanResult {
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
}

function classifyAIError(error: Error): { message: string; status: number } {
  const msg = error.message || "";

  if (msg.includes("Unknown AI provider")) {
    return { message: "不支持的 AI 服务提供商", status: 400 };
  }
  if (msg.includes("No AI provider configured")) {
    return { message: "AI 服务未配置，请在 .env 中设置 API Key", status: 503 };
  }
  if (msg.includes("quota") || msg.includes("Quota") || msg.includes("rate limit") || msg.includes("429")) {
    return { message: "AI 服务免费额度已用完，请明天再试或切换其他 Provider", status: 429 };
  }
  if (msg.includes("API key") || msg.includes("apiKey") || msg.includes("401") || msg.includes("Unauthorized")) {
    return { message: "AI API 密钥无效，请检查 .env 配置", status: 401 };
  }
  if (msg.includes("timeout") || msg.includes("Timeout") || msg.includes("ETIMEDOUT") || msg.includes("ECONNRESET")) {
    return { message: "AI 服务响应超时，请重试", status: 504 };
  }
  if (msg.includes("not found") || msg.includes("NOT_FOUND")) {
    return { message: "AI 模型不可用，请检查模型名称配置", status: 404 };
  }

  if (msg.includes("Can't reach database") || msg.includes("P1001")) {
    return { message: "数据库连接失败，请检查网络", status: 503 };
  }

  return { message: "AI 分析失败，请稍后重试", status: 500 };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = scanRequestBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message ?? "请求参数无效" },
        { status: 400 }
      );
    }

    const { imageBase64, provider } = parseResult.data;

    const useMock = process.env.MOCK_AI === "true";
    let result: ScanResult;

    if (useMock) {
      await new Promise((r) => setTimeout(r, 800));
      result = getMockResult();
      console.log("[scan] Mock mode — returning simulated data");
    } else {
      const rawBase64 = imageBase64.includes(",")
        ? imageBase64.split(",")[1]!
        : imageBase64;

      const rawBuffer = Buffer.from(rawBase64, "base64");
      const imageBuffer = await normalizeImage(rawBuffer);
      console.log(`[scan] Image: ${rawBuffer.length} -> ${imageBuffer.length} bytes`);
      const model = getModel(provider as AIProvider | undefined);

      const { object } = await generateObject({
        model,
        schema: scanResultSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请分析这张食品配料表/营养成分表的图片。仔细识别所有文字信息，提取产品名称、品牌、营养成分数据和所有添加剂。根据添加剂数量和类型、糖分、钠含量等综合评估健康评分。",
              },
              {
                type: "image",
                image: imageBuffer,
              },
            ],
          },
        ],
      });
      result = object;
    }

    let scanId: string | undefined;
    try {
      let dbUser = await prisma.user.findUnique({
        where: { email: authUser.email ?? "" },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: authUser.email!,
            name: authUser.user_metadata?.name ?? authUser.user_metadata?.full_name,
          },
        });
      }

      const productName = result.productName ?? "未知产品";
      const productBrand = result.brand ?? null;

      let product = await prisma.product.findFirst({
        where: {
          name: productName,
          brand: productBrand,
        },
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            name: productName,
            brand: productBrand,
            category: result.category ?? null,
          },
        });
      }

      const scan = await prisma.scan.create({
        data: {
          userId: dbUser.id,
          productId: product.id,
          healthScore: result.healthScore,
          sugar: result.sugar ?? null,
          sodium: result.sodium ?? null,
          fat: result.fat ?? null,
          protein: result.protein ?? null,
          calories: result.calories ?? null,
          additives: result.additives ?? [],
          highRiskAdditives: result.highRiskAdditives ?? undefined,
          allergens: result.allergens ?? undefined,
          summary: result.summary ?? null,
          aiProvider: useMock ? "mock" : (provider ?? process.env.AI_PROVIDER ?? null),
          rawResponse: result as object,
        },
      });
      scanId = scan.id;
    } catch (dbError) {
      console.warn("[scan] Database save failed (result still returned):", dbError);
    }

    return NextResponse.json({
      result: { ...result, id: scanId },
      scanId,
    });
  } catch (error) {
    console.error("[scan] Error:", error);

    if (error instanceof Error) {
      const { message, status } = classifyAIError(error);
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: "分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
