"use client"

import { Button } from "@/components/ui/button"
import { PopoverContent } from "@/components/ui/popover"
import { APP_NAME } from "@/lib/config"
import Image from "next/image"

/**
 * Authentication popover - not used in Telegram Mini App
 * Telegram handles authentication via initData
 */
export function PopoverContentAuth() {
  // This component is not used in Telegram Mini App context
  // Authentication is handled via Telegram WebApp initData
  return (
    <PopoverContent
      className="w-[300px] overflow-hidden rounded-xl p-0"
      side="top"
      align="start"
    >
      <Image
        src="/banner_forest.jpg"
        alt={`calm paint generate by ${APP_NAME}`}
        width={300}
        height={128}
        className="h-32 w-full object-cover"
      />
      <div className="p-3">
        <p className="text-primary mb-1 text-base font-medium">
          Authentication via Telegram
        </p>
        <p className="text-muted-foreground mb-5 text-base">
          Please use this app through Telegram to access all features.
        </p>
        <Button
          variant="secondary"
          className="w-full text-base"
          size="lg"
          disabled
        >
          <span>Available in Telegram only</span>
        </Button>
      </div>
    </PopoverContent>
  )
}
