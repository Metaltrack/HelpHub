"use client"

import { useState, useEffect, Provider } from "react"
import { ArrowLeft, Loader2, ShieldCheck, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"

interface OTPVerificationProps {
  phoneNumber: string
  onVerify: (otp: string) => void
  onResend: () => void
  onBack: () => void
}

export function OTPVerification({ phoneNumber, onVerify, onResend, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [resendTimer, canResend])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    setError("")
    setIsVerifying(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    onVerify(otp)
    setIsVerifying(false)
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    onResend()
    setIsResending(false)
    setResendTimer(30)
    setCanResend(false)
    setOtp("")
  }

  const maskedPhone = phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4 sm:p-6 lg:p-8">
      <Card className="relative w-full max-w-md border border-border shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary sm:left-6 sm:top-6"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        
        <CardHeader className="space-y-2 pb-6 pt-12 text-center sm:pt-10">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-110 hover:bg-accent hover:shadow-lg">
            <ShieldCheck className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">Verify Your Phone</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {"We've sent a 6-digit code to"}{" "}
            <span className="font-semibold text-primary">{maskedPhone}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          <div className="flex flex-col items-center gap-3">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value)
                setError("")
              }}
              className="gap-2 sm:gap-3"
            >
              <InputOTPGroup className="gap-1.5 sm:gap-2">
                <InputOTPSlot index={0} className="size-11 rounded-lg border-2 text-lg font-semibold transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-12" />
                <InputOTPSlot index={1} className="size-11 rounded-lg border-2 text-lg font-semibold transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-12" />
                <InputOTPSlot index={2} className="size-11 rounded-lg border-2 text-lg font-semibold transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-12" />
              </InputOTPGroup>
              <InputOTPSeparator className="text-muted-foreground" />
              <InputOTPGroup className="gap-1.5 sm:gap-2">
                <InputOTPSlot index={3} className="size-11 rounded-lg border-2 text-lg font-semibold transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-12" />
                <InputOTPSlot index={4} className="size-11 rounded-lg border-2 text-lg font-semibold transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-12" />
                <InputOTPSlot index={5} className="size-11 rounded-lg border-2 text-lg font-semibold transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:size-12" />
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg active:translate-y-0 sm:h-12"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground">
            <span>{"Didn't receive the code?"}</span>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:text-accent disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3" />
                    Resend OTP
                  </>
                )}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1">
                Resend in{" "}
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {resendTimer}
                </span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
