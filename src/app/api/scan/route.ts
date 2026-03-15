import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { getModel } from "@/lib/ai";
import type { AIProvider } from "@/lib/ai";
import { scanResultSchema } from "@/lib/schema";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scanRequestBodySchema = z.object({
  imageBase64: z.string().min(1, "图片数据不能为空"),
  provider: z.string().optional(),
});

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

    const imageData =
      imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

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
              image: imageData,
            },
          ],
        },
      ],
    });

    const result = object;

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
        aiProvider: provider ?? process.env.AI_PROVIDER ?? null,
        rawResponse: result as object,
      },
    });

    return NextResponse.json({
      result: { ...result, id: scan.id },
      scanId: scan.id,
    });
  } catch (error) {
    console.error("[scan] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unknown AI provider")) {
        return NextResponse.json(
          { error: "不支持的 AI 服务提供商" },
          { status: 400 }
        );
      }
      if (error.message.includes("No AI provider configured")) {
        return NextResponse.json(
          { error: "AI 服务未配置" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
