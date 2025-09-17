"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import LoginPage from "./login-page"
import OTPVerificationPage from "./otp-verification-page"

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoggedIn, login, loading } = useAuth()
  const [authStep, setAuthStep] = useState<"login" | "otp">("login")
  const [email, setEmail] = useState("")

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    if (authStep === "login") {
      return (
        <LoginPage
          onOTPSent={(userEmail) => {
            setEmail(userEmail)
            setAuthStep("otp")
          }}
        />
      )
    }

    return (
      <OTPVerificationPage
        email={email}
        onVerified={() => {
          login("")
          setAuthStep("login")
        }}
        onBack={() => setAuthStep("login")}
      />
    )
  }

  return <>{children}</>
}
