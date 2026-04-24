export interface ServiceCategory {
  id: string
  name: string
  icon: string
  description: string
}

export interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  location_lat: number
  location_lon: number
  address?: string
}

export interface Job {
  id: number
  customer_id: number
  provider_id?: number
  customer_name: string
  customer_phone: string
  customer_email?: string
  service_type: string
  description: string
  location_lat: number
  location_lon: number
  address: string
  status: "pending" | "accepted" | "completed" | "cancelled"
  created_at: string
  budget?: number
  urgency: "low" | "medium" | "high"
}

export interface ProviderWithDistance extends Omit<Customer, "id" | "name" | "phone" | "email"> {
  id: number
  provider_name: string
  provider_phone: string
  provider_service: string
  provider_desc?: string
  provider_img?: string
  provider_location_lat: number
  provider_location_lon: number
  rating: number
  completedJobs: number
  distance?: number
}
