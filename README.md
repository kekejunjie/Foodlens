# FoodLens - 食品配料表智能分析

拍照识别食品配料表，AI 智能分析健康评分。支持 HEIC/JPEG/PNG 等多种图片格式。

## 功能

- **智能识别** — 拍照/上传配料表图片，AI 自动提取成分信息
- **健康评分** — A/B/C/D 四级评分，综合添加剂、糖分、钠含量等指标
- **多 AI 引擎** — 通义千问、Gemini、OpenAI、Claude、Mistral 可插拔切换
- **扫描历史** — 记录每次扫描，支持按评分筛选
- **排行榜** — 个人 Top 10 + 社区健康食品排名
- **开发模式** — Mock AI 模式 + 示例图片，无需 API 配额即可测试全流程

## 技术栈

- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **AI**: Vercel AI SDK + 可插拔多 Provider（默认通义千问 Qwen-VL）
- **数据库**: Supabase (PostgreSQL) + Prisma ORM
- **认证**: Supabase Auth (Email/Password)
- **图片处理**: Sharp (服务端自动转换 HEIC/WEBP → JPEG)
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/FoodLens.git
cd FoodLens
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入你的配置：

```bash
cp .env.example .env
```

**必需配置：**
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 数据库: `DATABASE_URL`（推荐使用 Supabase Transaction Pooler）, `DIRECT_URL`（直连，用于 migration）
- AI (至少一个): `DASHSCOPE_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` 等

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── (auth)/          # 登录/注册页面
│   ├── (main)/          # 主功能页面 (scan, history, ranking)
│   ├── api/             # API 路由
│   └── page.tsx         # 首页
├── components/
│   ├── ui/              # shadcn/ui 组件
│   ├── camera-capture   # 相机/上传组件
│   ├── scan-result-card # 扫描结果卡片
│   └── health-score-badge # 健康评分徽章
├── lib/
│   ├── ai.ts            # AI Provider 抽象层
│   ├── prisma.ts        # Prisma 单例
│   ├── schema.ts        # Zod 验证 schema
│   └── supabase/        # Supabase 客户端
└── middleware.ts         # 路由保护
```

## AI Provider 配置

支持以下 AI 视觉模型，至少配置一个 API Key：

| Provider | 模型 | 环境变量 | 费用 |
|----------|------|----------|------|
| **通义千问** | qwen-vl-max | `DASHSCOPE_API_KEY` | 免费 100万 tokens/月 |
| Google Gemini | gemini-2.0-flash | `GOOGLE_GENERATIVE_AI_API_KEY` | 免费 1500次/天 |
| OpenAI | gpt-4o-mini | `OPENAI_API_KEY` | $0.15/M tokens |
| Anthropic | claude-3.5-haiku | `ANTHROPIC_API_KEY` | 新用户 $5 免费 |
| Mistral | pixtral-large | `MISTRAL_API_KEY` | 免费实验层 |

通过 `AI_PROVIDER` 环境变量设置默认 Provider（推荐 `qwen`），前端也支持手动切换。

### Mock 模式

设置 `MOCK_AI=true` 可跳过真实 AI 调用，返回模拟数据，用于开发和 UI 测试。

## 数据库配置

推荐使用 Supabase Transaction Pooler 连接（避免 VPN 等网络问题）：

```env
# 应用运行时使用 (Transaction Pooler, 端口 6543)
DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres

# Prisma migration 使用 (直连, 端口 5432)
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Settings → Environment Variables 中添加所有 `.env.example` 中列出的变量
4. 部署

```bash
npm i -g vercel
vercel --prod
```

## 命令行测试

```bash
npx tsx scripts/test-scan.ts <email> <password>
```

## License

MIT
