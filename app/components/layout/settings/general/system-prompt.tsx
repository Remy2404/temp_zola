"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useUser } from "@/lib/user-store/provider"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

export function SystemPromptSection() {
  // System prompt feature disabled since Supabase removal
  return (
    <div>
      <Label className="mb-3 text-sm font-medium">
        Default system prompt
      </Label>
      <div className="text-sm text-muted-foreground">
        System prompt customization is currently disabled.
      </div>
    </div>
  )
}
