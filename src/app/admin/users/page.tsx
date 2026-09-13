'use client'

import { useState } from 'react'
import styles from './page.module.css'

type UserRole = 'Citizen' | 'University Admin' | 'Faculty' | 'Industry Partner' | 'Admin'
type UserStatus = 'Active' | 'Suspended'

interface MockUser {
  id: string
  name: string
  email: string
  role: UserRole
  portal: string
  district?: string
  institution?: string
  status: UserStatus
}

const MOCK_USERS: MockUser[] = [
  { id: 'U-001', name: 'Priya Devi', email: 'priya@example.com', role: 'Citizen', portal: 'Citizen', district: 'Latehar', status: 'Active' },
  { id: 'U-002', name: 'Rajesh Sahu', email: 'rajesh@example.com', role: 'Citizen', portal: 'Citizen', district: 'Ranchi', status: 'Active' },
  { id: 'U-003', name: 'Dr. Meena Toppo', email: 'meena@bitmesra.ac.in', role: 'Faculty', portal: 'University', institution: 'BIT Mesra', status: 'Active' },
  { id: 'U-004', name: 'Prof. Anita Sharma', email: 'anita@bitmesra.ac.in', role: 'University Admin', portal: 'University', institution: 'BIT Mesra', status: 'Active' },
  { id: 'U-005', name: 'Rajiv Mehta', email: 'rajiv@tataprojects.com', role: 'Industry Partner', portal: 'Industry', status: 'Active' },
  { id: 'U-006', name: 'Suresh Kumar', email: 'suresh@jharkhand.gov.in', role: 'Admin', portal: 'Admin', status: 'Active' },
  { id: 'U-007', name: 'Anita Oraon', email: 'anita@example.com', role: 'Citizen', portal: 'Citizen', district: 'Gumla', status: 'Suspended' },
]

const ROLE_BADGE: Record<UserRole, string> = {
  'Citizen': 'badge-submitted',
  'University Admin': 'badge-inprogress',
  'Faculty': 'badge-assigned',
  'Industry Partner': 'badge-verification',
  'Admin': 'badge-resolved',
}

const ROLES: UserRole[] = ['Citizen', 'University Admin', 'Faculty', 'Industry Partner', 'Admin']

export default function UsersPage() {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS)

  function toggleStatus(id: string) {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
  }

  function changeRole(id: string, role: UserRole) {
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>User & Role Management</h1>
        <p className={styles.subtitle}>{users.length} registered users across all portals</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Portal</th>
                <th>District / Institution</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={u.status === 'Suspended' ? { background: 'var(--cf-50)', opacity: 0.75 } : undefined}>
                  <td style={{ fontWeight: 500, color: 'var(--cf-800)' }}>{u.name}</td>
                  <td className="text-xs text-secondary">{u.email}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)', minWidth: 0 }}
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value as UserRole)}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td><span className="tag">{u.portal}</span></td>
                  <td className="text-sm">{u.district ?? u.institution ?? '—'}</td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-resolved' : 'badge-review'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.status === 'Active' ? 'btn-outline' : 'btn-secondary'}`}
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
