"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Shield, ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { verifyOTP, sendOTP, setAuthToken } from "@/lib/auth"

interface OTPVerificationPageProps {
  email: string
  onVerified: () => void
  onBack: () => void
}

export default function OTPVerificationPage({ email, onVerified, onBack }: OTPVerificationPageProps) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Start cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOTPChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6)
    setOtp(numericValue)
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await verifyOTP(email, otp)
      setAuthToken(response.token)
      toast({
        title: "Success",
        description: "Login successful! Welcome to your dashboard",
      })
      onVerified()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP. Please try again"
      setError(errorMessage)
      // Clear OTP on error
      setOtp("")
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError("")
    try {
      await sendOTP(email)
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email",
      })
      setResendCooldown(60) // 1 minute cooldown
      setOtp("") // Clear current OTP
      inputRef.current?.focus()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  const isOTPComplete = otp.length === 6

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* OTP Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>Please enter the 6-digit code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => handleOTPChange(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className={`text-center text-xl font-bold tracking-widest h-14 ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                } transition-all duration-200`}
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Verify Button */}
            <Button onClick={handleVerifyOTP} disabled={!isOTPComplete || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || resendLoading}
                className={`text-sm ${resendCooldown > 0 ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <span className="inline-block w-5 h-5 mr-2 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>

            {/* Back Button */}
            <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
