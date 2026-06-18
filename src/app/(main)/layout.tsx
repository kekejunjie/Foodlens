import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-primary/15 via-accent/10 to-transparent" />
      <NavBar user={user ? { email: user.email ?? "" } : null} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-10 md:pt-24">
        {children}
      </main>
    </div>
  );
}
