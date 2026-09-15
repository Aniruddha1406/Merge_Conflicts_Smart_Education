'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { useStore } from '@/lib/store'
import styles from './page.module.css'

export default function CitizenProfilePage() {
  const { user } = useAuth()
  const { state } = useStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ email: user?.email ?? '', phone: '+91 98765 43210', language: 'hi' })

  const mySubmissions = state.submissions.slice(0, 3)
  const resolved = mySubmissions.filter(s => s.status === 'Resolved').length
  const inProgress = mySubmissions.filter(s => ['In Progress', 'Assigned to Institution'].includes(s.status)).length

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.layout}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>{user?.name?.[0] ?? 'C'}</div>
          <div className={styles.profileName}>{user?.name}</div>
          <div className={styles.profileRole}>Citizen — {user?.district}</div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{mySubmissions.length}</span>
              <span className={styles.statLabel}>Submitted</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{inProgress}</span>
              <span className={styles.statLabel}>In Progress</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{resolved}</span>
              <span className={styles.statLabel}>Resolved</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--cf-800)' }}>
              Contact Preferences
            </h2>
          </div>
          <form onSubmit={handleSave}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" defaultValue={user?.name} readOnly style={{ background: 'var(--warm-50)' }} />
                <span className="form-hint">Name is set by the government registry and cannot be changed here.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Language for Notifications</label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                >
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="en">English</option>
                  <option value="sat">Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                  <option value="ho">Ho (हो)</option>
                  <option value="mun">Mundari (मुंडारी)</option>
                </select>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              {saved && <span className={styles.savedToast}>Changes saved</span>}
              <button type="submit" className="btn btn-primary">Save Preferences</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
