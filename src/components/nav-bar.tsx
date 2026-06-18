"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CameraIcon, HistoryIcon, LeafIcon, TrophyIcon } from "lucide-react";
import { UserDropdown } from "@/components/user-dropdown";
import { cn } from "@/lib/utils";

interface NavBarProps {
  user: { email: string } | null;
}

const navLinks = [
  { href: "/scan", label: "扫描", Icon: CameraIcon },
  { href: "/history", label: "历史", Icon: HistoryIcon },
  { href: "/ranking", label: "排行", Icon: TrophyIcon },
] as const;

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 hidden px-4 pt-4 md:block">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-card/80 px-4 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <LeafIcon className="size-5" />
            </span>
            <span className="text-lg tracking-tight">FoodLens</span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full bg-muted/70 p-1">
            {navLinks.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div>
            {user ? (
              <UserDropdown email={user.email} />
            ) : (
              <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90">
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/60 bg-card/90 shadow-[0_-16px_40px_rgba(15,118,110,0.08)] backdrop-blur-xl md:hidden dark:border-white/10">
        <div className="flex h-20 w-full items-center justify-around px-2 pb-2">
          {navLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-medium transition-all",
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
