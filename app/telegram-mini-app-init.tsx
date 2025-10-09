"use client"

import { telegramWebApp } from "@/lib/telegram/client"
import { useUser } from "@/lib/user-store/provider"
import { useEffect } from "react"

/**
 * Telegram Mini App Initialization Component
 * Handles viewport expansion, theme setup, mobile optimization, and user authentication
 */
export function TelegramMiniAppInit() {
  const { user, setUser } = useUser()

  useEffect(() => {
    // Only run in Telegram environment
    if (!telegramWebApp.isAvailable()) {
      console.warn("[Telegram Mini App] Not running in Telegram environment")
      return
    }

    try {
      // Initialize Telegram WebApp
      telegramWebApp.init()

      const webapp = telegramWebApp.getWebApp()
      if (!webapp) return

      // Set header color to match Telegram theme
      const bgColor = webapp.themeParams?.bg_color || "#17212b"
      webapp.headerColor = bgColor
      webapp.backgroundColor = bgColor

      // Extract Telegram user data and set it to UserProvider
      const telegramUser = telegramWebApp.getUser()
      
      if (telegramUser && !user) {
        // Create a user object from Telegram data
        const userProfile = {
          id: String(telegramUser.id),
          display_name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
          profile_image: telegramUser.photo_url || '',
          email: telegramUser.username ? `${telegramUser.username}@telegram.user` : `${telegramUser.id}@telegram.user`,
          created_at: new Date().toISOString(),
          anonymous: false,
          premium: telegramUser.is_premium || false,
          favorite_models: null,
          message_count: null,
          daily_message_count: null,
          daily_reset: null,
          last_active_at: new Date().toISOString(),
          daily_pro_message_count: null,
          daily_pro_reset: null,
          system_prompt: null,
        }

        // Set the user in the UserProvider
        setUser(userProfile as any)
        
        console.log("[Telegram Mini App] User authenticated:", {
          id: telegramUser.id,
          name: userProfile.display_name,
          username: telegramUser.username,
        })
      }

      console.log("[Telegram Mini App] Initialized successfully", {
        version: webapp.version,
        platform: webapp.platform,
        colorScheme: webapp.colorScheme,
        viewportHeight: webapp.viewportHeight,
        isExpanded: webapp.isExpanded,
        hasUser: !!telegramUser,
      })
    } catch (error) {
      console.error("[Telegram Mini App] Initialization error:", error)
    }

    // Handle viewport changes (e.g., when keyboard appears)
    const handleViewportChange = () => {
      const webapp = telegramWebApp.getWebApp()
      if (!webapp) return

      const viewportHeight = webapp.viewportHeight
      const isExpanded = webapp.isExpanded
      
      console.log("[Telegram Mini App] Viewport changed:", {
        height: viewportHeight,
        isExpanded,
      })

      // You can adjust UI based on viewport changes
      // For example, hide certain elements when keyboard is open
      if (viewportHeight && viewportHeight < 400) {
        // Keyboard is likely open, adjust UI if needed
        document.documentElement.style.setProperty(
          "--telegram-viewport-height",
          `${viewportHeight}px`
        )
      }
    }

    // Listen for viewport changes
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent("viewportChanged", handleViewportChange)
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent(
          "viewportChanged",
          handleViewportChange
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  // This component doesn't render anything
  return null
}
