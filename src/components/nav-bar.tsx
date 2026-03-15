import Link from "next/link";
import { UserDropdown } from "@/components/user-dropdown";

interface NavBarProps {
  user: { email: string } | null;
}

const navLinks = [
  { href: "/scan", label: "扫描", icon: "📷" },
  { href: "/history", label: "历史", icon: "📋" },
  { href: "/ranking", label: "排行", icon: "🏆" },
] as const;

export function NavBar({ user }: NavBarProps) {
  return (
    <>
      {/* Desktop nav - hidden on mobile */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 w-full max-w-4xl mx-auto px-4 items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            FoodLens
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div>
            {user ? (
              <UserDropdown email={user.email} />
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center rounded-lg bg-primary px-2.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar - visible only on mobile */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 w-full items-center justify-around px-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
