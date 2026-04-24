"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, Phone, Lock, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import type { LoginFormData } from "@/types/provider"

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<string | null> // return error
  onNavigateToRegister: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onSubmit, onNavigateToRegister, onForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    phone: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        setIsLoading(true)

        const error = await onSubmit(formData)

        if (error) {
            if (error === "Invalid password") {
                setErrors({ password: "Wrong password" })
            } else if (error === "Provider not found") {
                setErrors({ phone: "Account not found" })
            } else {
                setErrors({ phone: error })
            }
        }

        setIsLoading(false)
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md border border-border shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-110 hover:bg-accent hover:shadow-lg">
            <LogIn className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome Back</CardTitle>
          <CardDescription className="text-sm sm:text-base">Sign in to your service provider account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="phone" className="text-sm font-medium">Phone Number</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-11 pl-10 transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12"
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && <FieldError>{errors.phone}</FieldError>}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="rounded px-1 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:text-accent sm:text-sm"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 pl-10 pr-10 transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>

              <Button 
                type="submit" 
                className="mt-2 h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg active:translate-y-0 sm:h-12" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                >
                  Register now
                </button>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
