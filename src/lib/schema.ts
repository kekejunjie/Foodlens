import { z } from "zod";

export const scanResultSchema = z.object({
  productName: z.string().describe("产品名称"),
  brand: z.string().optional().describe("品牌名称"),
  category: z
    .enum(["饮料", "零食", "乳制品", "调味品", "主食", "速食", "其他"])
    .optional()
    .describe("产品类别"),
  healthScore: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "综合健康评分：A=优秀(天然/少添加剂), B=良好, C=一般(较多添加剂), D=较差(高糖/高钠/多添加剂)"
    ),
  sugar: z.number().optional().describe("含糖量 g/100g"),
  sodium: z.number().optional().describe("钠含量 mg/100g"),
  fat: z.number().optional().describe("脂肪含量 g/100g"),
  protein: z.number().optional().describe("蛋白质含量 g/100g"),
  calories: z.number().optional().describe("热量 kcal/100g"),
  additives: z.array(z.string()).describe("所有食品添加剂名称列表"),
  highRiskAdditives: z
    .array(z.string())
    .optional()
    .describe(
      "高风险添加剂列表（如苯甲酸钠、山梨酸钾、亚硝酸钠、人工色素等）"
    ),
  allergens: z
    .array(z.string())
    .optional()
    .describe("过敏原信息（如含麸质、乳制品、大豆、坚果等）"),
  summary: z
    .string()
    .describe("一句话中文总结该产品的健康状况和主要关注点"),
});

export type ScanResult = z.infer<typeof scanResultSchema>;
