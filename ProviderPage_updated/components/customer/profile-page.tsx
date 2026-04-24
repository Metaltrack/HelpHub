"use client"

import { useState } from "react"
import { MapPin, Mail, Phone, User, LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Customer } from "@/types/customer"

interface CustomerProfilePageProps {
  customer: Customer
  onUpdate: (data: Customer) => void
  onLogout: () => void
  onNavigateBack: () => void
}

export function CustomerProfilePage({
  customer,
  onUpdate,
  onLogout,
  onNavigateBack,
}: CustomerProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Customer>(customer)
  const [locationStatus, setLocationStatus] = useState("")

  const handleGetLocation = () => {
    setLocationStatus("Getting location...")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location_lat: position.coords.latitude,
            location_lon: position.coords.longitude,
          })
          setLocationStatus("Location updated successfully!")
          setTimeout(() => setLocationStatus(""), 3000)
        },
        () => {
          setLocationStatus("Failed to get location")
          setTimeout(() => setLocationStatus(""), 3000)
        }
      )
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onNavigateBack}
              variant="outline"
              size="sm"
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Profile</h1>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/5 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Section - Personal Info */}
          <div className="lg:col-span-1 bg-white rounded-xl border-2 border-primary/10 p-4 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-primary">Personal Info</h2>
            </div>

            <div className="space-y-4">
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                {formData.name.charAt(0).toUpperCase()}
              </div>

              {/* Name Field */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-primary/20 focus:border-primary"
                    placeholder="Your name"
                  />
                ) : (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="font-bold text-primary">{formData.name}</p>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Phone</label>
                {isEditing ? (
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-primary/20 focus:border-primary"
                    placeholder="Your phone"
                  />
                ) : (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex items-center gap-2 hover:bg-primary/8 hover:border-primary/20 transition-all duration-300">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${formData.phone}`} className="font-bold text-primary hover:text-primary/80">
                      {formData.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="border-primary/20 focus:border-primary"
                    placeholder="Your email"
                  />
                ) : (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex items-center gap-2 hover:bg-primary/8 hover:border-primary/20 transition-all duration-300">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${formData.email}`} className="font-bold text-primary hover:text-primary/80 truncate">
                      {formData.email || "Not provided"}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center & Right Section - Location Info */}
          <div className="lg:col-span-2 bg-white rounded-xl border-2 border-primary/10 p-4 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-primary">Location</h2>
            </div>

            <div className="space-y-4">
              {/* Address Field */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block">Address</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    className="border-primary/20 focus:border-primary"
                    placeholder="Your address"
                  />
                ) : (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="font-bold text-primary">{formData.address || "Not provided"}</p>
                  </div>
                )}
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-2 block">Latitude</label>
                  <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <p className="font-mono text-sm text-gray-700">{formData.location_lat.toFixed(4)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-2 block">Longitude</label>
                  <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <p className="font-mono text-sm text-gray-700">{formData.location_lon.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* Location Status */}
              {locationStatus && (
                <div className={`p-3 rounded-lg text-sm font-bold ${
                  locationStatus.includes("success")
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {locationStatus}
                </div>
              )}

              {/* Get Location Button */}
              {isEditing && (
                <Button
                  onClick={handleGetLocation}
                  variant="outline"
                  className="w-full border-primary/20 text-primary hover:bg-primary/5"
                >
                  📍 Get Current Location
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Edit/Save Buttons */}
        <div className="mt-8 flex gap-3 justify-center">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-success hover:bg-success/90 text-white transition-all duration-300 px-8"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setFormData(customer)
                  setIsEditing(false)
                }}
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5 px-8"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/90 text-white transition-all duration-300 px-8"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
