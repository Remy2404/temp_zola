"use server"

import { toast } from "@/components/ui/toast"

export async function signOut() {
  // Since Supabase has been removed and we use Telegram authentication,
  // sign out is handled by the Telegram Mini App
  toast({
    title: "Sign out through Telegram",
    description: "Please use Telegram's interface to sign out",
    status: "info",
  })
}
