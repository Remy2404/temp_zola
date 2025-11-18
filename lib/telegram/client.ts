/**
 * Telegram WebApp SDK Client
 * Handles initialization and interaction with Telegram Mini App
 */

import { useState, useEffect } from 'react'
import logger from '@/lib/logger'
import type { TelegramUser, TelegramWebApp, TelegramWebAppInitData } from './types'

class TelegramWebAppClient {
  private webapp: TelegramWebApp | null = null
  private initialized = false

  /**
   * Initialize Telegram WebApp
   */
  init(): boolean {
    if (typeof window === 'undefined') {
      logger.info('[Telegram WebApp] Skipping init - running on server')
      return false
    }

    if (!window.Telegram?.WebApp) {
      logger.warn('[Telegram WebApp] ⚠️ SDK not loaded - not running in Telegram')
      return false
    }

    this.webapp = window.Telegram.WebApp
    this.webapp.ready()
    this.webapp.expand()
    this.initialized = true

    const user = this.getUser()
    logger.info('[Telegram WebApp] ✅ Initialized:', {
      version: this.webapp.version,
      platform: this.webapp.platform,
      colorScheme: this.webapp.colorScheme,
      userId: user?.id || 'no user',
      username: user?.username || 'no username',
      hasInitData: !!this.webapp.initData,
    })

    return true
  }

  /**
   * Check if running in Telegram WebApp
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp
  }

  /**
   * Get current Telegram user
   */
  getUser(): TelegramUser | null {
    if (!this.webapp) {
      return null
    }

    return this.webapp.initDataUnsafe.user || null
  }

  /**
   * Get user ID for backend authentication
   */
  getUserId(): number | null {
    const user = this.getUser()
    return user?.id || null
  }

  /**
   * Get init data for backend validation
   */
  getInitData(): string {
    return this.webapp?.initData || ''
  }

  /**
   * Get parsed init data
   */
  getInitDataUnsafe(): TelegramWebAppInitData | null {
    return this.webapp?.initDataUnsafe || null
  }

  /**
   * Get theme parameters
   */
  getTheme() {
    return {
      colorScheme: this.webapp?.colorScheme || 'light',
      params: this.webapp?.themeParams || {},
    }
  }

  /**
   * Show Telegram back button
   */
  showBackButton(onClick: () => void) {
    if (!this.webapp) return

    this.webapp.BackButton.onClick(onClick)
    this.webapp.BackButton.show()
  }

  /**
   * Hide Telegram back button
   */
  hideBackButton() {
    if (!this.webapp) return
    this.webapp.BackButton.hide()
  }

  /**
   * Show main button
   */
  showMainButton(text: string, onClick: () => void) {
    if (!this.webapp) return

    this.webapp.MainButton.setText(text)
    this.webapp.MainButton.onClick(onClick)
    this.webapp.MainButton.show()
  }

  /**
   * Hide main button
   */
  hideMainButton() {
    if (!this.webapp) return
    this.webapp.MainButton.hide()
  }

  /**
   * Show alert
   */
  showAlert(message: string, callback?: () => void) {
    if (!this.webapp) return
    this.webapp.showAlert(message, callback)
  }

  /**
   * Show confirm dialog
   */
  showConfirm(message: string, callback?: (confirmed: boolean) => void) {
    if (!this.webapp) return
    this.webapp.showConfirm(message, callback)
  }

  /**
   * Close the mini app
   */
  close() {
    if (!this.webapp) return
    this.webapp.close()
  }

  /**
   * Open link in browser
   */
  openLink(url: string) {
    if (!this.webapp) return
    this.webapp.openLink(url)
  }

  /**
   * Send data to bot
   */
  sendData(data: Record<string, unknown>) {
    if (!this.webapp) return
    this.webapp.sendData(JSON.stringify(data))
  }

  /**
   * Enable closing confirmation
   */
  enableClosingConfirmation() {
    if (!this.webapp) return
    this.webapp.enableClosingConfirmation()
  }

  /**
   * Disable closing confirmation
   */
  disableClosingConfirmation() {
    if (!this.webapp) return
    this.webapp.disableClosingConfirmation()
  }

  /**
   * Get WebApp instance
   */
  getWebApp(): TelegramWebApp | null {
    return this.webapp
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}

// Singleton instance
export const telegramWebApp = new TelegramWebAppClient()

/**
 * React hook for Telegram WebApp
 */
export function useTelegramWebApp() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (telegramWebApp.init()) {
      setIsReady(true)
    }
  }, [])

  return {
    isReady,
    webapp: telegramWebApp,
    user: telegramWebApp.getUser(),
    userId: telegramWebApp.getUserId(),
    theme: telegramWebApp.getTheme(),
  }
}

export default telegramWebApp
