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
  institution?: { id: string; name: string; shortName: string; location: string }
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
    id: 'U-CITIZEN-001',
    name: 'Priya Mahato',
    role: 'citizen',
    email: 'priya@demo.in',
    district: 'Ranchi',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.citizen.demo',
  },
  university: {
    id: 'U-UNI-001',
    name: 'Dr. Anjali Singh',
    role: 'university',
    email: 'anjali@bitmesra.ac.in',
    institution: {
      id: 'INST-001',
      name: 'Birla Institute of Technology',
      shortName: 'BIT Mesra',
      location: 'Ranchi, Jharkhand'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.university.demo',
  },
  industry: {
    id: 'U-IND-001',
    name: 'Rajesh Tata',
    role: 'industry',
    email: 'rajesh@tataprojects.com',
    institution: { id: 'IND-001', name: 'Tata Projects CSR', shortName: 'Tata CSR', location: 'Jamshedpur' },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.industry.demo',
  },
  government: {
    id: 'U-GOV-001',
    name: 'IAS Sanjeev Kumar',
    role: 'government',
    email: 'sanjeev@jharkhand.gov.in',
    institution: { id: 'GOV-001', name: 'Dept. of Higher & Technical Education', shortName: 'Govt', location: 'Ranchi' } as any,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.government.demo',
  },
  superadmin: {
    id: 'U-SADMIN',
    name: 'Super Admin',
    role: 'superadmin',
    email: 'admin@sicp.jharkhand.gov.in',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.superadmin.demo',
  },
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS.citizen)

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
