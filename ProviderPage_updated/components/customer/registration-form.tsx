'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, User, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CustomerRegistrationData {
    name: string
    phone: string
    email: string
    password: string
    confirmPassword: string
    locationLat?: number
    locationLon?: number
    address?: string
}

interface CustomerRegistrationFormProps {
  onSubmit: (data: CustomerRegistrationData) => void
  onNavigateToLogin: () => void
}

export function CustomerRegistrationForm({
  onSubmit,
  onNavigateToLogin,
}: CustomerRegistrationFormProps) {
    const [formData, setFormData] = useState<CustomerRegistrationData>({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [locationMessage, setLocationMessage] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid phone number'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email'
    }
    if (formData.locationLat === undefined || formData.locationLon === undefined) {
      newErrors.location = 'Location is required'
    }
      if (!formData.password.trim()) {
          newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters'
      }

      if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = 'Confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
      }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getLocation = () => {
    setLocationStatus('loading')
    setLocationMessage('')

    if (!navigator.geolocation) {
      setLocationStatus('error')
      setLocationMessage('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          locationLat: position.coords.latitude,
          locationLon: position.coords.longitude,
          address: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`,
        }))
        setLocationStatus('success')
        setLocationMessage('Location obtained successfully')
        setTimeout(() => setLocationMessage(''), 3000)
      },
      (error) => {
        setLocationStatus('error')
        setLocationMessage(error.message || 'Failed to get location')
      }
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white text-2xl">
              👤
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-accent">Join Now</h1>
          </div>
          <p className="text-gray-600">Create your customer account to find services</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-accent/10 p-6 sm:p-8 shadow-sm"
        >
          {/* Name Field */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-accent/60" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full h-11 pl-10 pr-4 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Phone Field */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-accent/60" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full h-11 pl-10 pr-4 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-accent/60" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full h-11 pl-10 pr-4 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

                  {/* Password Field */}
                  <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                          <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Enter your password"
                              className="w-full h-11 pl-4 pr-4 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none transition-colors"
                          />
                      </div>
                      {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                          <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm your password"
                              className="w-full h-11 pl-4 pr-4 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none transition-colors"
                          />
                      </div>
                      {errors.confirmPassword && (
                          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                      )}
                  </div>

          {/* Location Field */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-accent/60" />
                <input
                  type="text"
                  value={formData.address || 'Click button to get location'}
                  readOnly
                  className="w-full h-11 pl-10 pr-4 border-2 border-accent/10 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <Button
                type="button"
                onClick={getLocation}
                disabled={locationStatus === 'loading'}
                className={`px-4 h-11 transition-all duration-300 ${
                  locationStatus === 'success'
                    ? 'bg-success hover:bg-success/90'
                    : locationStatus === 'error'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-accent hover:bg-accent/90'
                } text-white`}
              >
                {locationStatus === 'loading' ? '⏳' : <Navigation className="w-4 h-4" />}
              </Button>
            </div>
            {locationMessage && (
              <p
                className={`text-xs mt-1 ${
                  locationStatus === 'success' ? 'text-success' : 'text-red-600'
                }`}
              >
                {locationMessage}
              </p>
            )}
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold text-base transition-all duration-300 mb-4"
          >
            Create Account
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-accent hover:text-accent/80 font-bold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
