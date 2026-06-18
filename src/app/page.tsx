import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckCircle2Icon,
  LeafIcon,
  ScanLineIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "拍照即分析",
    description: "对准配料表或营养成分表上传，自动提取产品、品牌、营养和添加剂信息。",
    Icon: ScanLineIcon,
  },
  {
    title: "健康评分可读",
    description: "用 A-D 评分、风险提示和营养条形图，把复杂标签翻译成清晰建议。",
    Icon: ShieldCheckIcon,
  },
  {
    title: "长期记录对比",
    description: "保存扫描历史，按评分筛选，并查看个人与社区的健康食品排行。",
    Icon: TrophyIcon,
  },
] as const;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_32rem),radial-gradient(circle_at_85%_5%,rgba(250,204,21,0.2),transparent_28rem)]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <LeafIcon className="size-5" />
          </span>
          <span className="text-xl tracking-tight">FoodLens</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user && (
            <Link
              href="/history"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              历史记录
            </Link>
          )}
          <Link
            href={user ? "/scan" : "/login"}
            className="inline-flex h-10 items-center justify-center rounded-full border bg-card/80 px-4 text-sm font-semibold shadow-sm backdrop-blur transition-colors hover:bg-card"
          >
            {user ? "进入应用" : "登录"}
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-8 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:pb-24 md:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <SparklesIcon className="size-4" />
              食品标签，一眼看懂
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
              拍一下配料表，
              <span className="block bg-gradient-to-r from-primary to-emerald-700 bg-clip-text text-transparent">
                吃得更有把握。
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              FoodLens 将食品包装上的成分、添加剂和营养数据整理成清晰的健康评分，
              帮你快速判断这款产品是否值得放进购物车。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link
                href="/scan"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                开始扫描
                  <ArrowRightIcon className="size-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                免费注册
                  <ArrowRightIcon className="size-4" />
              </Link>
            )}
              <Link
                href="/ranking?tab=community"
                className="inline-flex h-12 items-center justify-center rounded-full border bg-card/80 px-6 text-base font-semibold shadow-sm backdrop-blur transition-colors hover:bg-card"
              >
                查看排行
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm text-muted-foreground">
              {["成分识别", "风险提示", "历史对比"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-accent/60 blur-2xl" />
            <div className="absolute -right-5 bottom-8 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-card/80 p-4 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-950 to-emerald-700 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100/80">本次分析</p>
                    <h2 className="mt-1 text-2xl font-semibold">无糖燕麦酸奶</h2>
                  </div>
                  <span className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl font-bold">
                    A
                  </span>
                </div>
                <div className="mt-8 grid gap-3">
                  {[
                    ["糖", "2.8g", "w-1/5", "bg-emerald-300"],
                    ["蛋白质", "7.6g", "w-3/4", "bg-lime-300"],
                    ["钠", "68mg", "w-1/4", "bg-cyan-300"],
                  ].map(([label, value, width, color]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-50/80">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                        <div className={`${width} h-full rounded-full ${color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-background/70 p-4">
                  <CameraIcon className="size-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">扫描标签</p>
                  <p className="mt-1 text-xs text-muted-foreground">上传包装照片即可开始</p>
                </div>
                <div className="rounded-2xl border bg-background/70 p-4">
                  <ShieldCheckIcon className="size-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">风险提示</p>
                  <p className="mt-1 text-xs text-muted-foreground">添加剂与过敏原更醒目</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <Card
                key={title}
                className="border-white/60 bg-card/80 shadow-xl shadow-emerald-950/5 transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-white/10"
              >
                <CardHeader className="p-6">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription className="leading-6">{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
