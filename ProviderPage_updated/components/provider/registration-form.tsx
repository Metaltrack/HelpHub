"use client"

import { useState } from "react"
import { MapPin, Eye, EyeOff, Loader2, Phone, Mail, User, Lock, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import type { RegistrationFormData } from "@/types/provider"

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void
  onNavigateToLogin: () => void
}

export function RegistrationForm({ onSubmit, onNavigateToLogin }: RegistrationFormProps) {
    const API = "http://localhost:8000"

  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    locationLat: null,
    locationLon: null,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationStatus, setLocationStatus] = useState<string>("")
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof RegistrationFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser")
      return
    }

    setIsGettingLocation(true)
    setLocationStatus("Getting your location...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          locationLat: position.coords.latitude,
          locationLon: position.coords.longitude,
        }))
        setLocationStatus(`Location obtained: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus("Location permission denied")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationStatus("Location information unavailable")
            break
          case error.TIMEOUT:
            setLocationStatus("Location request timed out")
            break
          default:
            setLocationStatus("An unknown error occurred")
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

    //const handleRegister = async (data: any) => {
    //    try {
    //        const res = await fetch(`${API}/providers/register`, {
    //            method: "POST",
    //            headers: {
    //                "Content-Type": "application/json"
    //            },
    //            body: JSON.stringify({
    //                name: data.name,
    //                phone: data.phone,
    //                email: data.email,
    //                password: data.password,
    //                locationLat: data.locationLat,
    //                locationLon: data.locationLon 
    //            })
    //        })

    //        const result = await res.json()

    //        if (!res.ok) {
    //            throw new Error(result.detail || "Registration failed")
    //        }

    //        console.log(result)

    //    } catch (err: any) {
    //        console.error(err)
    //    }
    //}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
      if (validate()) {
          //handleRegister(formData)
         onSubmit(formData)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md border border-border shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-110 hover:bg-accent hover:shadow-lg">
            <Sparkles className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">Create an Account</CardTitle>
          <CardDescription className="text-sm sm:text-base">Join as a service provider and grow your business</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-sm font-medium">Full Name</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-11 pl-10 transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12"
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>

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
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email <span className="font-normal text-muted-foreground">(Optional)</span>
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11 pl-10 transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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

              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 pl-10 pr-10 transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
              </Field>

              <Field>
                <FieldLabel className="text-sm font-medium">Location</FieldLabel>
                <Button
                  type="button"
                  variant={formData.locationLat ? "outline" : "secondary"}
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className={`h-11 w-full justify-start transition-all duration-200 sm:h-12 ${
                    formData.locationLat
                      ? "border-success bg-success/10 text-success hover:bg-success hover:text-success-foreground"
                      : "hover:border-primary hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {isGettingLocation ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : formData.locationLat ? (
                    <CheckCircle2 className="mr-2 size-4" />
                  ) : (
                    <MapPin className="mr-2 size-4" />
                  )}
                  {formData.locationLat ? "Location Obtained" : "Get My Location"}
                </Button>
                {locationStatus && (
                  <p className={`text-xs sm:text-sm ${formData.locationLat ? "text-success" : "text-destructive"}`}>
                    {locationStatus}
                  </p>
                )}
              </Field>

              <Button 
                type="submit" 
                className="mt-2 h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg active:translate-y-0 sm:h-12"
              >
                Continue
              </Button>

              <p className="pt-2 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                >
                  Sign in
                </button>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
