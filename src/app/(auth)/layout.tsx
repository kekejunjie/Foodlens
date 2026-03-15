import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="mb-8 text-xl font-semibold text-foreground hover:text-primary transition-colors"
      >
        FoodLens
      </Link>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
