"use client"

import { useState } from "react"
import { RegistrationForm } from "@/components/provider/registration-form"
import { OTPVerification } from "@/components/provider/otp-verification"
import { LoginForm } from "@/components/provider/login-form"
import { ProfilePage } from "@/components/provider/profile-page"
import { CustomerHomePage } from "@/components/customer/home-page"
import { CustomerProfilePage } from "@/components/customer/profile-page"
import { ProviderJobsPage } from "@/components/provider/jobs-page"
import { CustomerRegistrationForm, type CustomerRegistrationData } from "@/components/customer/registration-form"
import { CustomerLoginForm, type CustomerLoginData } from "@/components/customer/login-form"
import type { Provider, RegistrationFormData, LoginFormData } from "@/types/provider"
import type { Customer } from "@/types/customer"

type UserRole = "provider" | "customer"
type ProviderView = "login" | "register" | "otp" | "profile" | "jobs"
type CustomerView = "login" | "register" | "home" | "profile"

export default function Home() {
    const API = "http://localhost:8000"
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  // Provider states
  const [providerView, setProviderView] = useState<ProviderView>("login")
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null)
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null)

  // Customer states
  const [customerView, setCustomerView] = useState<CustomerView>("login")
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
    if (role === "provider") {
      setProviderView("login")
    }
  }

  // Provider handlers
  const handleRegistration = async (data: RegistrationFormData) => {
      setRegistrationData(data)
      const res = await fetch(`${API}/providers/send-otp`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              phone: data.phone
          })
      })
    setProviderView("otp")
  }

    const handleOTPVerify = async (otp: string) => {
        try {
            if (registrationData) {
                const res = await fetch(`${API}/providers/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: registrationData.name,
                        phone: registrationData.phone,
                        email: registrationData.email,
                        password: registrationData.password,
                        locationLat: registrationData.locationLat ?? null,
                        locationLon: registrationData.locationLon ?? null,
                        provider_otp: otp
                    })
                })

                const result = await res.json()

                if (!res.ok) {
                    throw new Error(result.detail || "Registration failed")
                }
                console.log("OTP verified:", otp)

                if (registrationData) {
                    const provider: Provider = {
                        provider_name: registrationData.name,
                        provider_phone: registrationData.phone,
                        provider_password: registrationData.password,
                        provider_email: registrationData.email || undefined,
                        provider_location_lat: registrationData.locationLat || undefined,
                        provider_location_lon: registrationData.locationLon || undefined,
                    }

                    setCurrentProvider(provider)
                    setProviderView("profile")
                }
                console.log(result)
            }

        } catch (err: any) {
            console.error(err)
        }
  }

    const handleOTPResend = async () => {
        if (registrationData) {
            const res = await fetch(`${API}/providers/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone: registrationData.phone
                })
            })
            console.log("OTP resent to:", registrationData?.phone)
        }
  }

    const handleLogin = async (data: LoginFormData): Promise<string | null> => {
        try {
            const res = await fetch(`${API}/providers/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (!res.ok) {
                return result.detail || "Login failed"
            }

            setCurrentProvider(result.provider)
            setProviderView("profile")

            return null // success

        } catch (err) {
            return "Server error. Try again."
        }
    }

  const handleForgotPassword = () => {
    alert("Forgot password functionality would be implemented here")
  }

  const handleProfileUpdate = (data: Provider) => {
    console.log("Profile updated:", data)
    setCurrentProvider(data)
  }

  const handleLogout = () => {
    setCurrentProvider(null)
    setCurrentCustomer(null)
    setRegistrationData(null)
    setProviderView("login")
    setCustomerView("login")
    setUserRole(null)
  }

  // Customer handlers
    const handleCustomerRegistration = async (data: CustomerRegistrationData) => {
        try {
            const res = await fetch(`${API}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.detail || "Registration failed")
            }

            if (result.user) {
                setCurrentCustomer({
                    id: result.user.user_id,
                    name: result.user.user_name,
                    phone: result.user.user_phone,
                    email: result.user.user_email,
                    location_lat: result.user.user_lat,
                    location_lon: result.user.user_lon,
                    address: ""
                })
            }
            setCustomerView("home")

        } catch (err: any) {
            console.error(err.message)
        }
    }

    const handleCustomerLogin = async (data: any) => {
        try {
            const res = await fetch(`${API}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone: data.phone,
                    password: data.password
                })
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.detail)
            }

            console.log("Login success:", result)

            // ✅ SET CUSTOMER STATE (THIS WAS MISSING)
            setCurrentCustomer({
                id: result.user.user_id,
                name: result.user.user_name,
                phone: result.user.user_phone,
                email: result.user.user_email,
                location_lat: result.user.user_lat,
                location_lon: result.user.user_lon,
                address: ""
            })

            // ✅ move to home page
            setCustomerView("home")

            // optional
            localStorage.setItem("user", JSON.stringify(result.user))

        } catch (err: any) {
            alert(err.message)
        }
    }

  const handleCustomerForgotPassword = () => {
    alert("Forgot password functionality would be implemented here")
  }

  const handleCustomerProfileUpdate = (data: Customer) => {
    setCurrentCustomer(data)
    console.log("Customer profile updated:", data)
  }

  // Role selection view
  if (userRole === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white text-3xl">
                ⚡
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-primary">ServiceHub</h1>
            </div>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
              Connect services with people. Choose your role to get started.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Provider Card */}
            <div
              onClick={() => handleRoleSelect("provider")}
              className="bg-white rounded-2xl border-2 border-primary/10 p-8 sm:p-12 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:border-primary/40 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  🔧
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">I&apos;m a Service Provider</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Register your business, manage jobs, connect with customers, and grow your service.
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-primary font-bold">✓</span> Get job requests from customers
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-primary font-bold">✓</span> Manage your profile & ratings
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-primary font-bold">✓</span> Contact customers directly
                  </li>
                </ul>
                <button
                  onClick={() => handleRoleSelect("provider")}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue as Provider
                </button>
              </div>
            </div>

            {/* Customer Card */}
            <div
              onClick={() => handleRoleSelect("customer")}
              className="bg-white rounded-2xl border-2 border-accent/10 p-8 sm:p-12 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:border-accent/40 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  👤
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-accent mb-3">I&apos;m a Customer</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Find trusted service providers near you, post jobs, and get quality work done.
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-accent font-bold">✓</span> Search services by location
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-accent font-bold">✓</span> View ratings & reviews
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-accent font-bold">✓</span> Contact providers directly
                  </li>
                </ul>
                <button
                  onClick={() => handleRoleSelect("customer")}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue as Customer
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-gray-600 text-sm">
              Choose your role above to get started with ServiceHub
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Provider views
  if (userRole === "provider") {
    switch (providerView) {
      case "register":
        return (
          <RegistrationForm
            onSubmit={handleRegistration}
            onNavigateToLogin={() => setProviderView("login")}
          />
        )

      case "otp":
        return (
          <OTPVerification
            phoneNumber={registrationData?.phone || ""}
            onVerify={handleOTPVerify}
            onResend={handleOTPResend}
            onBack={() => setProviderView("register")}
          />
        )

        case "jobs":
            return currentProvider ? (
                <ProviderJobsPage
                    onLogout={handleLogout}
                    onNavigateToProfile={() => setProviderView("profile")}
                    provider={currentProvider}   
                    API={API}                    
                />
            ) : null

      case "profile":
        return currentProvider ? (
          <ProfilePage
            provider={currentProvider}
            onUpdate={handleProfileUpdate}
            onLogout={handleLogout}
            onNavigateToJobs={() => setProviderView("jobs")}
          />
        ) : null

      case "login":
      default:
        return (
          <LoginForm
            onSubmit={handleLogin}
            onNavigateToRegister={() => setProviderView("register")}
            onForgotPassword={handleForgotPassword}
          />
        )
    }
  }

  // Customer views
  if (userRole === "customer") {
    switch (customerView) {
      case "register":
        return (
          <CustomerRegistrationForm
            onSubmit={handleCustomerRegistration}
            onNavigateToLogin={() => setCustomerView("login")}
          />
        )

      case "profile":
        return currentCustomer ? (
          <CustomerProfilePage
            customer={currentCustomer}
            onUpdate={handleCustomerProfileUpdate}
            onLogout={handleLogout}
            onNavigateBack={() => setCustomerView("home")}
          />
        ) : null

        case "home":
            if (!currentCustomer) {
                return <div className="p-4">Loading user...</div>
            }

            return (
                <CustomerHomePage
                    onLogout={handleLogout}
                    onNavigateToProfile={() => setCustomerView("profile")}
                    API={API}
                />
            )

      case "login":
      default:
        return (
          <CustomerLoginForm
            onSubmit={handleCustomerLogin}
            onNavigateToRegister={() => setCustomerView("register")}
            onForgotPassword={handleCustomerForgotPassword}
          />
        )
    }
  }

  return null
}
