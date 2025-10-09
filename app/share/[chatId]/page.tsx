import { APP_DOMAIN } from "@/lib/config"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Article from "./article"

export const dynamic = "force-static"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}): Promise<Metadata> {
  // Public sharing has been disabled since Supabase removal
  return notFound()
}

export default async function ShareChat({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  // Public sharing has been disabled since Supabase removal
  return notFound()
}
