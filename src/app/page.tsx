import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      {/* Hero section with gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
            FoodLens
          </h1>
          <p className="mt-4 text-lg text-white/90 md:text-xl">
            拍照识别配料表，AI 智能分析食品健康
          </p>
          <div className="mt-8">
            {user ? (
              <Link
                href="/scan"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-medium text-teal-600 shadow-lg transition-colors hover:bg-white/90"
              >
                开始扫描
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-medium text-teal-600 shadow-lg transition-colors hover:bg-white/90"
              >
                免费注册
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 bg-card shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-2 text-3xl">🔍</div>
              <CardTitle>智能识别</CardTitle>
              <CardDescription>AI 识别配料表，精准提取成分信息</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-card shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-2 text-3xl">📊</div>
              <CardTitle>健康评分</CardTitle>
              <CardDescription>A/B/C/D 评级，一目了然食品健康度</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-card shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="mb-2 text-3xl">🏆</div>
              <CardTitle>排行对比</CardTitle>
              <CardDescription>社区健康食品排名，选对更安心</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
