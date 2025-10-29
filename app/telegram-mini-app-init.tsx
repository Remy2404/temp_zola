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
    // Skip if user is already authenticated
    if (user) {
      console.log("[Telegram Mini App] User already authenticated, skipping initialization")
      return
    }

    // Check if running in Telegram environment
    const isInTelegram = telegramWebApp.isAvailable()
    
    if (!isInTelegram) {
      console.warn("[Telegram Mini App] Not running in Telegram environment - attempting fallback authentication")
      
      // Fallback authentication: check for user_id in URL parameters
      // This handles the "Open" button scenario where the app is opened outside Telegram
      if (typeof window !== 'undefined') {
        try {
          const urlParams = new URLSearchParams(window.location.search)
          const userIdParam = urlParams.get('user_id')
          
          if (userIdParam) {
            console.log("[Telegram Mini App] Found user_id in URL parameters:", userIdParam)
            
            // Create a minimal user object for fallback authentication
            const fallbackUserProfile = {
              id: userIdParam,
              display_name: 'User',
              profile_image: '',
              email: `${userIdParam}@telegram.user`,
              created_at: new Date().toISOString(),
              anonymous: false,
              premium: false,
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
            setUser(fallbackUserProfile as any)
            
            console.log("[Telegram Mini App] Fallback authentication successful:", {
              id: userIdParam,
              name: fallbackUserProfile.display_name,
            })
          } else {
            console.warn("[Telegram Mini App] No user_id found in URL parameters - authentication failed")
          }
        } catch (error) {
          console.error("[Telegram Mini App] Fallback authentication error:", error)
        }
      }
      
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

  }, [user]) 
  return null
}
