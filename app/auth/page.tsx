import { redirect } from "next/navigation"

export default function AuthPage() {
  // Since Supabase has been removed and we use Telegram authentication,
  // redirect to main page
  redirect("/")
}
