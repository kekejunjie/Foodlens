import Link from "next/link";
import { LeafIcon } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.2),transparent_28rem),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.2),transparent_24rem)]" />
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-semibold text-foreground transition-colors hover:text-primary"
      >
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <LeafIcon className="size-5" />
        </span>
        FoodLens
      </Link>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
