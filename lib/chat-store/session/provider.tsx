"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useMemo } from "react"
import logger from "@/lib/logger"

const ChatSessionContext = createContext<{ chatId: string | null }>({
  chatId: null,
})

export const useChatSession = () => useContext(ChatSessionContext)

export function ChatSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const chatId = useMemo(() => {
    if (pathname?.startsWith("/c/")) {
      const pathAfterC = pathname.slice(3)
      try {
        // Try to decode - this handles properly encoded URLs
        return decodeURIComponent(pathAfterC)
      } catch (e) {
        // If decoding fails, use the raw path (handles URLs with special chars that aren't encoded)
        logger.warn('Failed to decode chat ID from URL, using raw path:', pathAfterC)
        return pathAfterC
      }
    }
    return null
  }, [pathname])

  return (
    <ChatSessionContext.Provider value={{ chatId }}>
      {children}
    </ChatSessionContext.Provider>
  )
}
