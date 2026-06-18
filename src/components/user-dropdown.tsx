"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LogOutIcon, UserIcon } from "lucide-react";

interface UserDropdownProps {
  email: string;
}

export function UserDropdown({ email }: UserDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="max-w-48 rounded-full border-primary/20 bg-background/70 px-2.5 text-foreground shadow-sm"
      >
        <UserIcon className="size-3.5" />
        <span className="truncate">{email}</span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border bg-popover p-2 shadow-xl shadow-emerald-950/10">
            <p className="px-2 py-1.5 text-xs text-muted-foreground truncate">
              {email}
            </p>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <LogOutIcon className="size-4" />
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}
