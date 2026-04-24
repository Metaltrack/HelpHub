"use client"

import { useState, useEffect } from "react"
import { MapPin, Star, Search, Phone, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProviderWithDistance, ServiceCategory } from "@/types/customer"
import { mockProviders, serviceCategories, mockJobs } from "@/utils/mock-data"

interface CustomerHomePageProps {
  onNavigateToJobs?: () => void
  onNavigateToProfile?: () => void
  onLogout: () => void
}

export function CustomerHomePage({ onLogout, onNavigateToProfile }: CustomerHomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [filteredProviders, setFilteredProviders] = useState<ProviderWithDistance[]>(mockProviders)
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithDistance | null>(null)

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {
          // Default to NYC if geolocation fails
          setUserLocation({ lat: 40.7128, lon: -74.006 })
        }
      )
    }
  }, [])

  // Calculate distance between two coordinates (simple Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter providers based on category and search
  useEffect(() => {
    let filtered = mockProviders

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.provider_service.toLowerCase() === selectedCategory.toLowerCase())
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.provider_desc?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Add distance calculations
    if (userLocation) {
      filtered = filtered.map((p) => ({
        ...p,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lon,
          p.provider_location_lat,
          p.provider_location_lon
        ),
      }))

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    setFilteredProviders(filtered)
  }, [selectedCategory, searchQuery, userLocation])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Find Services</h1>
          <div className="flex gap-2 sm:gap-3">
            {onNavigateToProfile && (
              <Button
                onClick={onNavigateToProfile}
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            )}
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/5 transition-all duration-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary/5 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Find Trusted Services Near You
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Connect with verified service providers in your area. Get quality work done fast.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
              <Input
                type="text"
                placeholder="Search providers by name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 sm:py-4 text-base sm:text-lg border-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/40"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                selectedCategory === null
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white border-2 border-primary/20 text-gray-700 hover:border-primary/50 hover:shadow-md"
              }`}
            >
              All Services
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white border-2 border-primary/20 text-gray-700 hover:border-primary/50 hover:shadow-md"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Providers List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No providers found. Try adjusting your search or category.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-xl border-2 border-primary/10 p-4 sm:p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4"
                onClick={() => setSelectedProvider(provider)}
              >
                {/* Provider Avatar and Main Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-primary flex-shrink-0">
                    {provider.provider_name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-primary">{provider.provider_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{provider.provider_service}</p>
                    <p className="text-sm text-gray-600 line-clamp-1">{provider.provider_desc}</p>
                    
                    {/* Rating and Distance - Mobile View */}
                    <div className="flex items-center gap-3 mt-2 sm:hidden text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="font-bold text-primary">{provider.rating}</span>
                        <span className="text-gray-600">({provider.completedJobs})</span>
                      </div>
                      {provider.distance && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {provider.distance.toFixed(1)} mi
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Rating and Distance */}
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-bold text-primary">{provider.rating}</span>
                    <span className="text-gray-600">({provider.completedJobs})</span>
                  </div>
                  
                  {provider.distance && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 min-w-fit">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      {provider.distance.toFixed(1)} mi
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProvider(provider)
                    }}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white transition-all duration-300"
                    size="sm"
                  >
                    View
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `tel:${provider.provider_phone}`
                    }}
                    variant="outline"
                    className="flex-1 sm:flex-none border-primary/20 text-primary hover:bg-primary/5"
                    size="sm"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary/5 p-4 sm:p-6 border-b border-primary/10 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-1">{selectedProvider.provider_name}</h3>
                <p className="text-sm text-gray-600">{selectedProvider.provider_service}</p>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Rating Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <div>
                    <p className="font-bold text-lg text-primary">{selectedProvider.rating}</p>
                    <p className="text-sm text-gray-600">{selectedProvider.completedJobs} completed jobs</p>
                  </div>
                </div>
                {selectedProvider.distance && (
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{selectedProvider.distance.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">miles away</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-primary mb-2">About</h4>
                <p className="text-gray-600">{selectedProvider.provider_desc}</p>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-bold text-primary mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {selectedProvider.provider_phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Service Type:</strong> {selectedProvider.provider_service}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-primary/10">
                <Button
                  onClick={() => {
                    window.location.href = `tel:${selectedProvider.provider_phone}`
                    setSelectedProvider(null)
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white transition-all duration-300 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </Button>
                <Button
                  onClick={() => {
                    setSelectedProvider(null)
                  }}
                  variant="outline"
                  className="flex-1 border-primary/20 text-primary hover:bg-primary/5 gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
