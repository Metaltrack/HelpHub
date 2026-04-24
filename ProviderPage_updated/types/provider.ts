export interface Provider {
  id?: number
  provider_name: string
  provider_phone: string
  provider_password: string
  provider_email?: string
  provider_desc?: string
  provider_img?: string // Base64 encoded image
  provider_location_lat?: number
  provider_location_lon?: number
  provider_service?: string
}

export interface RegistrationFormData {
  name: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  locationLat: number | null
  locationLon: number | null
}

export interface LoginFormData {
  phone: string
  password: string
}
