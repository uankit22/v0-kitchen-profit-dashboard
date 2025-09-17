const API_BASE = "https://cloud-kitchen-backend-5dnj.onrender.com/api"

export interface AuthResponse {
  token: string
}

export interface OTPResponse {
  message: string
}

export interface RestaurantResponse {
  restaurant_name: string | null
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null
}

// API functions
export const sendOTP = async (email: string): Promise<OTPResponse> => {
  const response = await fetch(`${API_BASE}/auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error("Failed to send OTP")
  }

  return response.json()
}

export const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  })

  if (!response.ok) {
    throw new Error("Invalid OTP")
  }

  return response.json()
}

export const getRestaurantName = async (): Promise<RestaurantResponse> => {
  const token = getAuthToken()
  if (!token) throw new Error("No authentication token")

  console.log("[v0] Making request to get restaurant name with token:", token ? "present" : "missing")

  const response = await fetch(`${API_BASE}/auth/get-restaurant`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  console.log("[v0] Restaurant name API response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.log("[v0] Restaurant name API error response:", errorText)

    // Handle specific error cases
    if (response.status === 401) {
      throw new Error("Authentication failed - please login again")
    } else if (response.status === 404) {
      // Restaurant name not found - return null
      return { restaurant_name: null }
    } else {
      throw new Error(`Failed to get restaurant name: ${response.status} - ${errorText}`)
    }
  }

  const data = await response.json()
  console.log("[v0] Restaurant name API response data:", data)
  return data
}

export const setRestaurantName = async (restaurantName: string): Promise<{ message: string }> => {
  const token = getAuthToken()
  if (!token) throw new Error("No authentication token")

  console.log("[v0] Setting restaurant name:", restaurantName)

  const response = await fetch(`${API_BASE}/auth/set-restaurant`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ restaurant_name: restaurantName }),
  })

  console.log("[v0] Set restaurant name API response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.log("[v0] Set restaurant name API error response:", errorText)

    if (response.status === 401) {
      throw new Error("Authentication failed - please login again")
    } else {
      throw new Error(`Failed to set restaurant name: ${response.status} - ${errorText}`)
    }
  }

  const data = await response.json()
  console.log("[v0] Set restaurant name API response data:", data)
  return data
}

// Email validation
export const isValidGmail = (email: string): boolean => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
  return gmailRegex.test(email)
}
