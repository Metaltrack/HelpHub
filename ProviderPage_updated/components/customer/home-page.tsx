"use client"

import { useState, useEffect } from "react"
import { MapPin, Star, Search, Phone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CustomerHomePage({ API, onLogout, onNavigateToProfile }: any) {
    const [searchQuery, setSearchQuery] = useState("")
    const [userLocation, setUserLocation] = useState<any>(null)
    const [providers, setProviders] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // =========================
    // GET USER LOCATION
    // =========================
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                })
            },
            () => {
                // fallback (Pune)
                setUserLocation({ lat: 18.6298, lon: 73.7997 })
            }
        )
    }, [])

    // =========================
    // FETCH PROVIDERS (AUTO)
    // =========================
    useEffect(() => {
        if (!userLocation) return

        const fetchProviders = async () => {
            setLoading(true)
            try {
                const res = await fetch(
                    `${API}/providers/nearby?lat=${userLocation.lat}&lon=${userLocation.lon}&service=${searchQuery}`
                )

                const data = await res.json()
                setProviders(data.providers || [])

            } catch (err) {
                console.error("Fetch failed:", err)
            } finally {
                setLoading(false)
            }
        }

        const delayDebounce = setTimeout(fetchProviders, 300) // debounce

        return () => clearTimeout(delayDebounce)

    }, [userLocation, searchQuery])

    return (
        <div className="min-h-screen bg-background">

            {/* HEADER */}
            <header className="p-4 flex justify-between border-b items-center">
                <h1 className="text-xl font-bold">Nearby Services</h1>

                <div className="flex gap-2">
                    <Button onClick={() => onNavigateToProfile()}>
                        Profile
                    </Button>

                    <Button variant="destructive" onClick={onLogout}>
                        Logout
                    </Button>
                </div>
            </header>

            {/* SEARCH */}
            <div className="p-4 max-w-xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                        className="pl-10"
                        placeholder="Search service (e.g. plumber, electrician)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto p-4">

                {loading && (
                    <div className="flex justify-center">
                        <Loader2 className="animate-spin" />
                    </div>
                )}

                {!loading && providers.length === 0 && (
                    <p className="text-center text-gray-500">
                        No providers found
                    </p>
                )}

                <div className="space-y-4">
                    {providers.map((p) => (
                        <div key={p.id} className="border p-4 rounded-xl shadow-sm">

                            <div className="flex justify-between">

                                <div>
                                    <h2 className="font-bold text-lg">{p.provider_name}</h2>
                                    <p className="text-sm text-gray-600">{p.provider_service}</p>
                                    <p className="text-sm text-gray-500">{p.provider_desc}</p>
                                </div>

                                <div className="text-right text-sm">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        4.5
                                    </div>

                                    <div className="flex items-center gap-1 text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        {p.distance.toFixed(2)} km
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="mt-3"
                                onClick={() => {
                                    window.location.href = `tel:${p.provider_phone}`
                                }}
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                            </Button>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}