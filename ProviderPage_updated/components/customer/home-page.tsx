"use client"

import { useState, useEffect } from "react"
import { MapPin, Star, Search, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CustomerHomePage({ API, user, onLogout, onNavigateToProfile }: any) {

    // =========================
    // STATE
    // =========================
    const [selectedProvider, setSelectedProvider] = useState<any>(null)
    const [jobDescription, setJobDescription] = useState("")
    const [budget, setBudget] = useState("")
    const [priority, setPriority] = useState("low")

    const [searchQuery, setSearchQuery] = useState("")
    const [userLocation, setUserLocation] = useState<any>(null)
    const [providers, setProviders] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // =========================
    // OPEN MODAL
    // =========================
    const openJobModal = (provider: any) => {
        setSelectedProvider(provider)
    }

    const closeModal = () => {
        setSelectedProvider(null)
        setJobDescription("")
        setBudget("")
        setPriority("low")
    }

    // =========================
    // GET LOCATION
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
                setUserLocation({ lat: 18.6298, lon: 73.7997 }) // fallback
            }
        )
    }, [])

    // =========================
    // FETCH PROVIDERS
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

        const delay = setTimeout(fetchProviders, 300)
        return () => clearTimeout(delay)

    }, [userLocation, searchQuery])

    // =========================
    // SUBMIT JOB
    // =========================
    const submitJob = async () => {
        if (!selectedProvider) return

        if (!jobDescription || !budget) {
            alert("Please fill all fields")
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch(`${API}/jobs/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    provider_id: selectedProvider.id,

                    customer_name: user.user_name,
                    customer_phone: user.user_phone,
                    customer_email: user.user_email,

                    description: jobDescription,
                    address: "User location",
                    location_lat: userLocation.lat,
                    location_lon: userLocation.lon,

                    budget: parseFloat(budget),
                    urgency: priority,
                    service_type: selectedProvider.provider_service
                })
            })

            if (!res.ok) throw new Error("Failed")

            alert("Job created successfully ✅")
            closeModal()

        } catch (err) {
            console.error(err)
            alert("Failed to create job ❌")
        } finally {
            setSubmitting(false)
        }
    }

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen bg-background">

            {/* HEADER */}
            <header className="p-4 flex justify-between border-b items-center">
                <h1 className="text-xl font-bold">Nearby Services</h1>

                <div className="flex gap-2">
                    <Button onClick={onNavigateToProfile}>
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

            {/* PROVIDERS */}
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
                                onClick={() => openJobModal(p)}
                            >
                                Create Job
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* =========================
                JOB MODAL
            ========================= */}
            {selectedProvider && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-[400px] space-y-4 relative">

                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3"
                        >
                            <X />
                        </button>

                        <h2 className="font-bold text-xl">
                            Create Job
                        </h2>

                        <p className="text-sm text-gray-500">
                            Provider: {selectedProvider.provider_name}
                        </p>

                        <textarea
                            className="w-full border p-2 rounded"
                            placeholder="Describe your issue"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />

                        <Input
                            placeholder="Budget"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />

                        <select
                            className="w-full border p-2 rounded"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority (+ extra pay)</option>
                        </select>

                        <Button
                            className="w-full"
                            onClick={submitJob}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit Job"}
                        </Button>

                    </div>
                </div>
            )}
        </div>
    )
}