'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { useStore } from '@/lib/store'
import { DASHBOARD_STATS } from '@/lib/mockData'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

// Simulate "my" submissions = first 3 in store
const MY_IDS = ['SUB-001', 'SUB-002', 'SUB-003']
const NEARBY_IDS = ['SUB-004', 'SUB-005', 'SUB-006']

export default function CitizenDashboard() {
  const { user } = useAuth()
  const { state, endorse } = useStore()
  const [endorsed, setEndorsed] = useState<Set<string>>(new Set())

  const mySubmissions = state.submissions.filter(s => MY_IDS.includes(s.id))
  const nearby = state.submissions.filter(s => NEARBY_IDS.includes(s.id))

  // Live stat counts from store
  const submitted = mySubmissions.filter(s => s.status === 'Submitted').length
  const inProgress = mySubmissions.filter(s => s.status === 'In Progress' || s.status === 'Assigned to Institution').length
  const pendingVerification = mySubmissions.filter(s => s.status === 'Pending Verification').length
  const resolved = mySubmissions.filter(s => s.status === 'Resolved').length

  // Verification alert: any of my submissions pending verification
  const verifyPending = mySubmissions.find(s => s.status === 'Pending Verification')

  function handleEndorse(id: string) {
    if (endorsed.has(id)) return
    endorse(id)
    setEndorsed(e => new Set(e).add(id))
  }

  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.pageTitle}>Welcome, {user?.name?.split(' ')[0] ?? 'Citizen'}</h1>
          <p className={styles.pageSubtitle}>
            {user?.district ? `${user.district} District — ` : ''}Track your submissions and help resolve community challenges.
          </p>
        </div>
        <Link href="/citizen/submit" className="btn btn-secondary">Submit a Challenge</Link>
      </div>

      {/* Live Stat Cards */}
      <div className={styles.summaryGrid}>
        {[
          { label: 'Submitted', value: submitted, color: 'var(--warm-600)' },
          { label: 'In Progress', value: inProgress, color: 'var(--db-500)' },
          { label: 'Pending Verification', value: pendingVerification, color: 'var(--ai-600)' },
          { label: 'Resolved', value: resolved, color: 'var(--cf-800)' },
        ].map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-card-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Verification Alert — only when relevant */}
      {verifyPending && (
        <div className={styles.verificationAlert}>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Action Required — Proof of Impact</div>
            <p className={styles.alertDesc}>
              Your challenge <strong>"{verifyPending.title}"</strong> is now Pending Verification.
              Please submit a geo-tagged, time-stamped photo confirming the fix to mark it Resolved.
            </p>
          </div>
          <Link href="/citizen/my-submissions" className="btn btn-primary btn-sm">
            Submit Verification
          </Link>
        </div>
      )}

      <div className={styles.twoCol}>
        {/* My Submissions — from store */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Submissions</h2>
            <span className="badge badge-submitted">{mySubmissions.length}</span>
          </div>
          <div className={styles.submissionList}>
            {mySubmissions.map(s => (
              <div className="card" key={s.id} style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-body">
                  <div className={styles.submissionHeader}>
                    <h3 className={styles.submissionTitle}>{s.title}</h3>
                    <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                  </div>
                  <div className={styles.submissionMeta}>
                    <span className="tag tag-accent">{s.domain}</span>
                    <span className="text-xs text-tertiary">{s.district}</span>
                    <span className="text-xs text-tertiary">{s.endorsements} endorsements</span>
                  </div>
                  {s.assignedInstitution && (
                    <div className={styles.assignedLine}>
                      <span className="text-xs text-secondary">Assigned to</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--cf-800)' }}>
                        {s.assignedInstitution}
                        {s.fitScore && ` — ${Math.round(s.fitScore * 100)}% fit`}
                      </span>
                    </div>
                  )}
                  {s.status === 'Pending Verification' && (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <Link href="/citizen/my-submissions" className="btn btn-secondary btn-sm">Upload Verification Photo</Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="/citizen/my-submissions" className="btn btn-ghost btn-sm">View all my submissions</Link>
        </div>

        {/* Nearby Challenges — live endorsement */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nearby Challenges</h2>
          </div>
          <p className={styles.sectionHint}>Endorse existing reports instead of duplicating them. The AI clusters similar submissions to boost urgency.</p>
          <div className={styles.submissionList}>
            {nearby.map(s => (
              <div className="card" key={s.id} style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-body">
                  <div className={styles.submissionHeader}>
                    <h3 className={styles.submissionTitle}>{s.title}</h3>
                    <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                  </div>
                  <div className={styles.submissionMeta}>
                    <span className="tag tag-accent">{s.domain}</span>
                    <span className="text-xs text-tertiary">{s.district}</span>
                  </div>
                  <div className={styles.endorseRow}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>
                      {s.endorsements} endorsements
                    </span>
                    <button
                      className={`btn btn-sm ${endorsed.has(s.id) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleEndorse(s.id)}
                      disabled={endorsed.has(s.id)}
                    >
                      {endorsed.has(s.id) ? 'Endorsed' : 'Endorse'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/citizen/community" className="btn btn-ghost btn-sm">View community map</Link>

          {/* Platform ticker */}
          <div className={styles.ticker}>
            <span className="text-xs text-secondary">
              <strong style={{ color: 'var(--cf-800)' }}>{DASHBOARD_STATS.totalSubmissions.toLocaleString()}</strong> challenges tracked across
              <strong style={{ color: 'var(--cf-800)' }}> {DASHBOARD_STATS.districtsCovered}</strong> districts —
              <strong style={{ color: 'var(--ai-700)' }}> {DASHBOARD_STATS.resolvedSubmissions}</strong> resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
