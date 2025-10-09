import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatsProvider } from "@/lib/chat-store/chats/provider"
import { ChatSessionProvider } from "@/lib/chat-store/session/provider"
import { ModelProvider } from "@/lib/model-store/provider"
import { TanstackQueryProvider } from "@/lib/tanstack-query/tanstack-query-provider"
import { UserPreferencesProvider } from "@/lib/user-preference-store/provider"
import { UserProvider } from "@/lib/user-store/provider"
import { ThemeProvider } from "next-themes"
import Script from "next/script"
import { LayoutClient } from "./layout-client"
import { TelegramMiniAppInit } from "./telegram-mini-app-init"
import { ClientProviders } from "./client-providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Polymind",
  description:
    "Polymind is an AI chat interface for Telegram. Multi-model support with streaming responses. Use Claude, OpenAI, Gemini, DeepSeek, and more, all in one place.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Telegram WebApp user will be loaded client-side
  // No server-side user fetching needed

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Telegram WebApp SDK should be inside <body>, not directly under <html> */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {/* ...existing code... */}
        <TanstackQueryProvider>
          <LayoutClient />
          <UserProvider initialUser={null}>
            <TelegramMiniAppInit />
            {/* ClientProviders reads the UserProvider client-side and
                passes the resolved userId into ChatsProvider and
                UserPreferencesProvider so they can fetch user-specific data. */}
            <ClientProviders>
              {children}
            </ClientProviders>
          </UserProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
