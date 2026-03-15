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
    <div className="min-h-screen">
      <NavBar user={user ? { email: user.email ?? "" } : null} />
      <main className="max-w-4xl mx-auto px-4 pt-6 md:pt-14 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}
