"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, ReceiptIndianRupeeIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendOTP, isValidGmail } from "@/lib/auth"

interface LoginPageProps {
  onOTPSent: (email: string) => void
}

export default function LoginPage({ onOTPSent }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSendOTP = async () => {
    setError("")

    if (!isValidGmail(email)) {
      const errorMsg = "Please enter a valid Gmail address (@gmail.com)"
      setError(errorMsg)
      toast({
        title: "Invalid Email",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await sendOTP(email)
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      })
      onOTPSent(email)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send OTP"
      setError(errorMsg)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isEmailValid = isValidGmail(email)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <ReceiptIndianRupeeIcon className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Welcome to Expense Tracker App</h1>
          <p className="text-muted-foreground">Sign in to manage your kitchen expenses</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>Enter your Gmail address to receive a verification code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              {email && !isEmailValid && <p className="text-sm text-destructive">Please enter a valid Gmail address</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button onClick={handleSendOTP} disabled={!isEmailValid || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Your data and expenses are end-to-end encrypted - no one can read them, just you</p>
        </div>
      </div>
    </div>
  )
}
