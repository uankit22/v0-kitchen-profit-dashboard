"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { isAuthenticated, removeAuthToken } from "@/lib/auth"

interface AuthContextType {
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on mount
    setIsLoggedIn(isAuthenticated())
    setLoading(false)
  }, [])

  const login = (token: string) => {
    setIsLoggedIn(true)
  }

  const logout = () => {
    removeAuthToken()
    setIsLoggedIn(false)
  }

  return <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
