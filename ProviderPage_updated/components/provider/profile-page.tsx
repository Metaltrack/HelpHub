"use client"

import { useState, useRef } from "react"
import { Camera, MapPin, Loader2, LogOut, Save, User, Phone, Mail, FileText, Briefcase, CheckCircle2, Star, TrendingUp, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import type { Provider } from "@/types/provider"

interface ProfilePageProps {
  provider: Provider
  onUpdate: (data: Provider) => void
  onLogout: () => void
  onNavigateToJobs?: () => void
}

export function ProfilePage({ provider, onUpdate, onLogout, onNavigateToJobs }: ProfilePageProps) {
  const [formData, setFormData] = useState<Provider>(provider)
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationStatus, setLocationStatus] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof Provider, string>>>({})
  const [successMessage, setSuccessMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof Provider]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setSuccessMessage("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, provider_img: "Image size must be less than 5MB" }))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, provider_img: reader.result as string }))
        setErrors((prev) => ({ ...prev, provider_img: undefined }))
      }
      reader.readAsDataURL(file)
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
          provider_location_lat: position.coords.latitude,
          provider_location_lon: position.coords.longitude,
        }))
        setLocationStatus(
          `Location updated: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        )
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
    const newErrors: Partial<Record<keyof Provider, string>> = {}

    if (!formData.provider_name?.trim()) {
      newErrors.provider_name = "Name is required"
    }

    if (!formData.provider_phone?.trim()) {
      newErrors.provider_phone = "Phone number is required"
    }

    if (formData.provider_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.provider_email)) {
      newErrors.provider_email = "Please enter a valid email address"
    }

    if (formData.provider_desc && formData.provider_desc.length > 256) {
      newErrors.provider_desc = "Description must be less than 256 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        setIsLoading(true)

        try {
            const res = await fetch("http://localhost:8000/providers/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.provider_name,
                    phone: formData.provider_phone,
                    email: formData.provider_email,
                    locationLat: formData.provider_location_lat,
                    locationLon: formData.provider_location_lon,
                    provider_desc: formData.provider_desc
                })
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.detail)
            }

            onUpdate(formData)
            setSuccessMessage("Profile updated successfully!")

        } catch (err: any) {
            setErrors({ provider_name: err.message })
        }

        setIsLoading(false)
    }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Mock metrics data
  const metrics = {
    totalJobs: 156,
    rating: 4.8,
    completionRate: 98,
    memberSince: "Jan 2023",
  }

  return (
    <div className="min-h-screen bg-secondary/50 p-3 sm:p-4 lg:p-6">
      {/* Top Header Bar */}
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between lg:mb-6">
        <h1 className="text-lg font-bold text-foreground sm:text-xl lg:text-2xl">Provider Dashboard</h1>
        <div className="flex gap-2">
          {onNavigateToJobs && (
            <Button 
              variant="outline" 
              onClick={onNavigateToJobs} 
              size="sm"
              className="gap-2 border-primary/20 text-primary transition-all duration-200 hover:bg-primary/5"
            >
              <span className="text-lg">📋</span>
              <span className="hidden sm:inline">My Jobs</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onLogout} 
            size="sm"
            className="gap-2 border-destructive/50 text-destructive transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {errors.provider_img && (
        <p className="mx-auto mb-4 max-w-7xl text-center text-sm text-destructive">{errors.provider_img}</p>
      )}

      {successMessage && (
        <div className="mx-auto mb-4 flex max-w-7xl items-center justify-center gap-2 rounded-lg border border-success/50 bg-success/10 px-4 py-3 transition-all duration-300">
          <CheckCircle2 className="size-5 text-success" />
          <p className="text-sm font-medium text-success">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl">
        {/* Three Column Layout - Horizontal on desktop, stacked on mobile */}
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          
          {/* Section 1: User Data */}
          <Card className="border border-border shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
                  <User className="size-4 text-primary" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Profile Avatar Section */}
              <div className="mb-5 flex flex-col items-center">
                <div className="group relative mb-3">
                  <Avatar className="size-20 border-4 border-primary/20 shadow-lg transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl sm:size-24">
                    <AvatarImage src={formData.provider_img} alt={formData.provider_name} />
                    <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground sm:text-2xl">
                      {getInitials(formData.provider_name || "SP")}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:scale-110 hover:bg-accent hover:shadow-lg"
                    aria-label="Change profile picture"
                  >
                    <Camera className="size-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Upload profile picture"
                  />
                </div>
                <h2 className="text-center text-lg font-bold text-foreground">{formData.provider_name || "Your Name"}</h2>
                <p className="text-sm text-muted-foreground">{formData.provider_service || "Service Provider"}</p>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="provider_name" className="text-sm font-medium">Full Name</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="provider_name"
                      name="provider_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.provider_name}
                      onChange={handleChange}
                      className="h-10 bg-secondary/50 pl-10 transition-all duration-200 hover:border-primary hover:bg-card focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 sm:h-11"
                      aria-invalid={!!errors.provider_name}
                    />
                  </div>
                  {errors.provider_name && <FieldError>{errors.provider_name}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="provider_phone" className="text-sm font-medium">Phone Number</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="provider_phone"
                      name="provider_phone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.provider_phone}
                      onChange={handleChange}
                      className="h-10 bg-secondary/50 pl-10 transition-all duration-200 hover:border-primary hover:bg-card focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 sm:h-11"
                      aria-invalid={!!errors.provider_phone}
                    />
                  </div>
                  {errors.provider_phone && <FieldError>{errors.provider_phone}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="provider_email" className="text-sm font-medium">
                    Email <span className="font-normal text-muted-foreground">(Optional)</span>
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="provider_email"
                      name="provider_email"
                      type="email"
                      placeholder="Email address"
                      value={formData.provider_email || ""}
                      onChange={handleChange}
                      className="h-10 bg-secondary/50 pl-10 transition-all duration-200 hover:border-primary hover:bg-card focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20 sm:h-11"
                      aria-invalid={!!errors.provider_email}
                    />
                  </div>
                  {errors.provider_email && <FieldError>{errors.provider_email}</FieldError>}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 2: Service Data & Description */}
          <Card className="border border-border shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent/10 transition-colors duration-200">
                  <Briefcase className="size-4 text-accent" />
                </div>
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="provider_service" className="text-sm font-medium">Service Type</FieldLabel>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="provider_service"
                      name="provider_service"
                      type="text"
                      placeholder="e.g., Plumbing, Electrical, Cleaning"
                      value={formData.provider_service || ""}
                      onChange={handleChange}
                      className="h-10 bg-secondary/50 pl-10 transition-all duration-200 hover:border-accent hover:bg-card focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20 sm:h-11"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="provider_desc" className="text-sm font-medium">
                    Description
                  </FieldLabel>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Textarea
                      id="provider_desc"
                      name="provider_desc"
                      placeholder="Tell customers about yourself and your services..."
                      value={formData.provider_desc || ""}
                      onChange={handleChange}
                      className="min-h-28 resize-none bg-secondary/50 pl-10 transition-all duration-200 hover:border-accent hover:bg-card focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20 sm:min-h-32"
                      maxLength={256}
                      aria-invalid={!!errors.provider_desc}
                    />
                  </div>
                  <div className="flex justify-between">
                    <div>
                      {errors.provider_desc && <FieldError>{errors.provider_desc}</FieldError>}
                    </div>
                    <p className={`text-xs ${(formData.provider_desc?.length || 0) > 200 ? "text-accent" : "text-muted-foreground"}`}>
                      {formData.provider_desc?.length || 0}/256
                    </p>
                  </div>
                </Field>

                {/* Location Section */}
                <div className="mt-2 rounded-lg border border-success/30 bg-success/5 p-3 transition-all duration-200 hover:border-success/50 hover:bg-success/10 sm:p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="size-4 text-success" />
                    <span className="text-sm font-semibold text-foreground">Location</span>
                  </div>
                  <Field>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getLocation}
                        disabled={isGettingLocation}
                        className={`h-10 w-full justify-start text-sm transition-all duration-200 ${
                          formData.provider_location_lat
                            ? "border-success/50 bg-success/10 text-success hover:bg-success hover:text-success-foreground"
                            : "hover:border-success hover:bg-success/10 hover:text-success"
                        }`}
                      >
                        {isGettingLocation ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : formData.provider_location_lat ? (
                          <CheckCircle2 className="mr-2 size-4" />
                        ) : (
                          <MapPin className="mr-2 size-4" />
                        )}
                        {formData.provider_location_lat ? "Update Location" : "Set Location"}
                      </Button>
                      {formData.provider_location_lat && formData.provider_location_lon && (
                        <div className="flex items-center gap-2 rounded-md bg-card px-3 py-2">
                          <MapPin className="size-3 text-success" />
                          <p className="text-xs text-muted-foreground">
                            {formData.provider_location_lat.toFixed(4)}, {formData.provider_location_lon.toFixed(4)}
                          </p>
                        </div>
                      )}
                      {locationStatus && (
                        <p
                          className={`text-xs ${
                            locationStatus.includes("updated") || locationStatus.includes("obtained")
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {locationStatus}
                        </p>
                      )}
                    </div>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 3: Metrics */}
          <Card className="border border-border shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200">
                  <TrendingUp className="size-4 text-primary" />
                </div>
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Total Jobs */}
                <div className="group rounded-lg border border-primary/20 bg-primary/5 p-3 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md sm:p-4">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/20">
                    <Briefcase className="size-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">{metrics.totalJobs}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">Total Jobs</p>
                </div>

                {/* Rating */}
                <div className="group rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-md sm:p-4">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-amber-500/10 transition-colors duration-200 group-hover:bg-amber-500/20">
                    <Star className="size-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">{metrics.rating}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">Avg Rating</p>
                </div>

                {/* Completion Rate */}
                <div className="group rounded-lg border border-success/20 bg-success/5 p-3 transition-all duration-200 hover:-translate-y-1 hover:border-success/50 hover:bg-success/10 hover:shadow-md sm:p-4">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-success/10 transition-colors duration-200 group-hover:bg-success/20">
                    <TrendingUp className="size-5 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">{metrics.completionRate}%</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">Completion</p>
                </div>

                {/* Member Since */}
                <div className="group rounded-lg border border-accent/20 bg-accent/5 p-3 transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:bg-accent/10 hover:shadow-md sm:p-4">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent/10 transition-colors duration-200 group-hover:bg-accent/20">
                    <Calendar className="size-5 text-accent" />
                  </div>
                  <p className="text-lg font-bold text-foreground sm:text-xl">{metrics.memberSince}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">Member Since</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/50 sm:p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Quick Stats</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-200 hover:bg-card">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold text-foreground">12 jobs</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-200 hover:bg-card">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="font-semibold text-success">95%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-200 hover:bg-card">
                    <span className="text-sm text-muted-foreground">Repeat Customers</span>
                    <span className="font-semibold text-primary">38</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-center lg:justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg active:translate-y-0 sm:h-12 lg:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
