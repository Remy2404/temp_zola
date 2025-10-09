"use client"

import { ModelProvider } from "@/lib/model-store/provider"
import { ChatsProvider } from "@/lib/chat-store/chats/provider"
import { ChatSessionProvider } from "@/lib/chat-store/session/provider"
import { UserPreferencesProvider } from "@/lib/user-preference-store/provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "next-themes"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useUser } from "@/lib/user-store/provider"
import React from "react"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  // Ensure we pass a string userId or undefined
  const userId = user?.id ? String(user.id) : undefined

  return (
    <ModelProvider>
      <ChatsProvider userId={userId}>
        <ChatSessionProvider>
          <UserPreferencesProvider userId={userId} initialPreferences={undefined}>
            <TooltipProvider delayDuration={200} skipDelayDuration={500}>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <SidebarProvider defaultOpen>
                  <Toaster position="top-center" />
                  {children}
                </SidebarProvider>
              </ThemeProvider>
            </TooltipProvider>
          </UserPreferencesProvider>
        </ChatSessionProvider>
      </ChatsProvider>
    </ModelProvider>
  )
}
