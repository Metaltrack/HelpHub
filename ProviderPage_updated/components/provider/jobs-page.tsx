"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, DollarSign, AlertCircle, CheckCircle, Trash2, User, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Job } from "@/types/customer"
import { mockJobs } from "@/utils/mock-data"
import { calculateDistance } from "@/utils/geo"

interface ProviderJobsPageProps {
  onLogout: () => void
  onNavigateToProfile?: () => void
}

type JobStatus = "pending" | "accepted" | "completed"

export function ProviderJobsPage({ onLogout, onNavigateToProfile }: ProviderJobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  // Mock provider location - in real app, this comes from logged-in provider data
  const providerLat = 40.7128
  const providerLon = -74.006

  const filteredJobs = activeFilter === "all" ? jobs : jobs.filter((job) => job.status === activeFilter)

  const handleAcceptJob = (jobId: number) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status: "accepted" as const } : job)))
    setSelectedJob(null)
  }

  const handleDeclineJob = (jobId: number) => {
    setJobs(jobs.filter((job) => job.id !== jobId))
    setSelectedJob(null)
  }

  const handleCompleteJob = (jobId: number) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status: "completed" as const } : job)))
    setSelectedJob(null)
  }

  const getStatusColor = (status: JobStatus | "all") => {
    switch (status) {
      case "pending":
        return "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
      case "accepted":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
      case "completed":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
      default:
        return "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-amber-600 bg-amber-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Jobs</h1>
            <p className="text-sm text-gray-600 mt-1">{filteredJobs.length} jobs found</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={onNavigateToProfile}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300"
            >
              Profile
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-primary/5 py-6 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "accepted", "completed"] as const).map((status) => {
              const counts = {
                all: jobs.length,
                pending: jobs.filter((j) => j.status === "pending").length,
                accepted: jobs.filter((j) => j.status === "accepted").length,
                completed: jobs.filter((j) => j.status === "completed").length,
              }

              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium border-2 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${
                    activeFilter === status
                      ? getStatusColor(status).replace("hover:", "")
                      : getStatusColor(status)
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No {activeFilter === "all" ? "" : activeFilter} jobs found</p>
            <p className="text-gray-500">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border-2 border-primary/10 p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-primary">{job.customer_name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency.toUpperCase()} PRIORITY
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full border-2 ${
                          job.status === "pending"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : job.status === "accepted"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary/60" />
                        <span className="text-gray-600">{job.address.split(",")[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-primary/60" />
                        <span className="font-bold text-primary">${job.budget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary/60" />
                        <span className="text-gray-600">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-primary/60" />
                        <span className="text-gray-600">{job.customer_phone}</span>
                      </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 transition-all duration-300 hover:bg-primary/8 hover:border-primary/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          <p className="text-sm font-bold text-primary">{job.customer_name}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent/20 text-accent">
                          📍 {calculateDistance(providerLat, providerLon, job.location_lat, job.location_lon).toFixed(1)} km away
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                          href={`tel:${job.customer_phone}`}
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors bg-white/50 rounded p-2 hover:bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-4 h-4" />
                          {job.customer_phone}
                        </a>
                        {job.customer_email && (
                          <a
                            href={`mailto:${job.customer_email}`}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors bg-white/50 rounded p-2 hover:bg-white truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{job.customer_email}</span>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 bg-white/50 rounded p-2">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="truncate">{job.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:w-48">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `tel:${job.customer_phone}`
                      }}
                      className="w-full bg-accent hover:bg-accent/90 text-white transition-all duration-300 gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </Button>
                    {job.status === "pending" && (
                      <>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAcceptJob(job.id)
                          }}
                          className="w-full bg-success hover:bg-success/90 text-white transition-all duration-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeclineJob(job.id)
                          }}
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}
                    {job.status === "accepted" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompleteJob(job.id)
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-300"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary/5 p-4 sm:p-6 border-b border-primary/10 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-1">{selectedJob.service_type}</h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${getUrgencyColor(
                      selectedJob.urgency
                    )}`}
                  >
                    {selectedJob.urgency.toUpperCase()} PRIORITY
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full border-2 ${
                      selectedJob.status === "pending"
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : selectedJob.status === "accepted"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-green-50 border-green-200 text-green-700"
                    }`}
                  >
                    {selectedJob.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Job Description */}
              <div>
                <h4 className="font-bold text-primary mb-2">Job Description</h4>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h4>
                <p className="text-gray-700">{selectedJob.address}</p>
              </div>

              {/* Budget */}
              {selectedJob.budget && (
                <div>
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget
                  </h4>
                  <p className="text-2xl font-bold text-primary">${selectedJob.budget}</p>
                </div>
              )}

              {/* Customer Contact */}
              <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border border-primary/10">
                <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-3 border border-primary/10">
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="font-bold text-primary text-lg">{selectedJob.customer_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`tel:${selectedJob.customer_phone}`}
                      className="bg-white rounded-lg p-3 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs text-gray-600 mb-1">Phone</p>
                      <p className="font-bold text-primary flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedJob.customer_phone}
                      </p>
                    </a>
                    
                    {selectedJob.customer_email && (
                      <a
                        href={`mailto:${selectedJob.customer_email}`}
                        className="bg-white rounded-lg p-3 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs text-gray-600 mb-1">Email</p>
                        <p className="font-bold text-primary flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{selectedJob.customer_email}</span>
                        </p>
                      </a>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-primary/10">
                    <p className="text-xs text-gray-600 mb-1">Location & Distance</p>
                    <p className="font-bold text-primary flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.address}
                    </p>
                    <p className="text-sm text-accent font-bold mt-2 flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      {calculateDistance(providerLat, providerLon, selectedJob.location_lat, selectedJob.location_lon).toFixed(1)} km away
                    </p>
                  </div>
                </div>
              </div>

              {/* Posted Time */}
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Posted on {new Date(selectedJob.created_at).toLocaleString()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary/10">
                {selectedJob.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleAcceptJob(selectedJob.id)}
                      className="flex-1 bg-success hover:bg-success/90 text-white transition-all duration-300 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Job
                    </Button>
                    <Button
                      onClick={() => handleDeclineJob(selectedJob.id)}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Decline
                    </Button>
                  </>
                )}
                {selectedJob.status === "accepted" && (
                  <Button
                    onClick={() => handleCompleteJob(selectedJob.id)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white transition-all duration-300 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Complete
                  </Button>
                )}
                <Button
                  onClick={() => {
                    window.location.href = `tel:${selectedJob.customer_phone}`
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white transition-all duration-300 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
