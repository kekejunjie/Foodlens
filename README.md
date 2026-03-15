# FoodLens - 食品配料表智能分析

拍照识别食品配料表，AI 智能分析健康评分。

## 功能

- **智能识别** — 拍照/上传配料表图片，AI 自动提取成分信息
- **健康评分** — A/B/C/D 四级评分，综合添加剂、糖分、钠含量等指标
- **多 AI 引擎** — 支持 Gemini、OpenAI、Claude、Mistral 一键切换
- **扫描历史** — 记录每次扫描，支持按评分筛选
- **排行榜** — 个人 Top 10 + 社区健康食品排名

## 技术栈

- **框架**: Next.js 15 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **AI**: Vercel AI SDK + 可插拔多 Provider
- **数据库**: Supabase (PostgreSQL) + Prisma ORM
- **认证**: Supabase Auth (Email/Password)
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
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
- AI (至少一个): `GOOGLE_GENERATIVE_AI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `MISTRAL_API_KEY`

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
| Google Gemini | gemini-2.5-flash | `GOOGLE_GENERATIVE_AI_API_KEY` | 免费 250次/天 |
| OpenAI | gpt-4o-mini | `OPENAI_API_KEY` | $0.15/M tokens |
| Anthropic | claude-3.5-haiku | `ANTHROPIC_API_KEY` | 新用户 $5 免费 |
| Mistral | pixtral-large | `MISTRAL_API_KEY` | 免费实验层 |

通过 `AI_PROVIDER` 环境变量设置默认 Provider，前端也支持手动切换。

## 部署到 Vercel

```bash
npm i -g vercel
vercel --prod
```

在 Vercel 项目设置中添加所有环境变量。

## License

MIT
