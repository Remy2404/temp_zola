"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeaderGoBack } from "../components/header-go-back"

export default function LoginPage() {
  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome to polymind
            </h1>
            <p className="text-muted-foreground mt-3">
              This application requires Telegram authentication.
            </p>
            <p className="text-muted-foreground mt-2">
              Please access this app through Telegram to use all features.
            </p>
          </div>
          <div className="mt-8">
            <Button
              variant="secondary"
              className="w-full text-base sm:text-base"
              size="lg"
              asChild
            >
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        {/* @todo */}
        <p>
          By continuing, you agree to our{" "}
          <Link href="/" className="text-foreground hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}
