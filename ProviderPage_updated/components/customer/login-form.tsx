'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CustomerLoginData {
    phone: string
    password: string
}

interface CustomerLoginFormProps {
  onSubmit: (data: CustomerLoginData) => void
  onNavigateToRegister: () => void
  onForgotPassword: () => void
}

export function CustomerLoginForm({
  onSubmit,
  onNavigateToRegister,
  onForgotPassword,
}: CustomerLoginFormProps) {
    const [formData, setFormData] = useState<CustomerLoginData>({
        phone: '',
        password: '',
    })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

      if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required'
      } else if (!/^\d{10}$/.test(formData.phone)) {
          newErrors.phone = 'Enter a valid 10-digit phone number'
      }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
            <h1 className="text-3xl sm:text-4xl font-bold text-accent">Welcome Back</h1>
          </div>
          <p className="text-gray-600">Sign in to your customer account</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-accent/10 p-6 sm:p-8 shadow-sm"
        >
          {/* Phone Field */}
                  <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                          Phone Number
                      </label>

                      <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-accent/60" />

                          <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              className="w-full h-11 pl-10 pr-4 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none"
                          />
                      </div>

                      {errors.phone && (
                          <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                      )}
                  </div>

          {/* Password Field */}
          <div className="mb-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-accent/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full h-11 pl-10 pr-10 border-2 border-accent/10 rounded-lg focus:border-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-accent/60 hover:text-accent transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-6">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-accent hover:text-accent/80 font-semibold transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold text-base transition-all duration-300 mb-4"
          >
            Sign In
          </Button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-accent hover:text-accent/80 font-bold transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
