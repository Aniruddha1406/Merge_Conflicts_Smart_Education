'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export type UserRole =
  | 'citizen'
  | 'university'
  | 'industry'
  | 'government'
  | 'superadmin'

export interface AuthUser {
  id: string
  name: string
  role: UserRole
  email: string
  institution?: string
  district?: string
  token: string // simulated JWT
}

interface AuthContextValue {
  user: AuthUser | null
  login: (role: UserRole) => void
  logout: () => void
  isAuthenticated: boolean
}

const DEMO_USERS: Record<UserRole, AuthUser> = {
  citizen: {
    id: 'USR-001',
    name: 'Sunita Devi',
    role: 'citizen',
    email: 'sunita.devi@example.in',
    district: 'Latehar',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.citizen.demo',
  },
  university: {
    id: 'USR-002',
    name: 'Prof. Anita Sharma',
    role: 'university',
    email: 'a.sharma@bitmesra.ac.in',
    institution: 'BIT Mesra',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.university.demo',
  },
  industry: {
    id: 'USR-003',
    name: 'Vikram Sinha',
    role: 'industry',
    email: 'v.sinha@tataprojects.com',
    institution: 'Tata Projects CSR',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.industry.demo',
  },
  government: {
    id: 'USR-004',
    name: 'Rajesh Kumar IAS',
    role: 'government',
    email: 'rajesh.kumar@jharkhand.gov.in',
    institution: 'Dept. of Higher & Technical Education',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.government.demo',
  },
  superadmin: {
    id: 'USR-005',
    name: 'Platform Administrator',
    role: 'superadmin',
    email: 'admin@sicp.jharkhand.gov.in',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.superadmin.demo',
  },
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS[role]
    // In production: validate OTP, exchange for real JWT, store in httpOnly cookie
    setUser(demoUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
