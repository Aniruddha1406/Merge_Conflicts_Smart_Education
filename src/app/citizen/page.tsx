'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { getChallengesByUser, getAllChallenges } from '@/app/actions/challenges'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

interface DbRow {
  id: string
  title: string
  status: string
  domain: string
  district: string
  endorsements: number
  assigned_institution_name?: string | null
  fit_score?: number | null
}

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [mySubmissions, setMySubmissions] = useState<DbRow[]>([])
  const [nearby, setNearby] = useState<DbRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const rows = await getChallengesByUser(user.id)
      setMySubmissions(rows as DbRow[])
      
      const allRows = await getAllChallenges()
      // Filter out own submissions, keep top 3 urgency
      const others = (allRows as DbRow[]).filter(r => r.district === user.district && !rows.find(my => my.id === r.id)).slice(0, 3)
      setNearby(others)
    } catch (e) {
      console.error('Failed to load dashboard', e)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  const submitted = mySubmissions.filter(s => s.status === 'Submitted').length
  const inProgress = mySubmissions.filter(s => s.status === 'In Progress' || s.status === 'Assigned to Institution').length
  const pendingVerification = mySubmissions.filter(s => s.status === 'Pending Verification').length
  const resolved = mySubmissions.filter(s => s.status === 'Resolved').length

  const verifyPending = mySubmissions.find(s => s.status === 'Pending Verification')

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.welcome}>
          <h1 className={styles.pageTitle}>Loading dashboard...</h1>
        </div>
      </div>
    )
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

      {/* Verification Alert */}
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
        {/* My Submissions */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Submissions</h2>
            <span className="badge badge-submitted">{mySubmissions.length}</span>
          </div>
          <div className={styles.submissionList}>
            {mySubmissions.slice(0, 3).map(s => (
              <div className="card" key={s.id} style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-body">
                  <div className={styles.submissionHeader}>
                    <h3 className={styles.submissionTitle}>{s.title}</h3>
                    <span className={`badge ${STATUS_BADGE[s.status] || 'badge-submitted'}`}>{s.status}</span>
                  </div>
                  <div className={styles.submissionMeta}>
                    <span className="tag tag-accent">{s.domain}</span>
                    <span className="text-xs text-tertiary">{s.district}</span>
                    <span className="text-xs text-tertiary">{s.endorsements} endorsements</span>
                  </div>
                  {s.assigned_institution_name && (
                    <div className={styles.assignedLine}>
                      <span className="text-xs text-secondary">Assigned to</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--cf-800)' }}>
                        {s.assigned_institution_name}
                        {s.fit_score && ` — ${Math.round(s.fit_score * 100)}% fit`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="/citizen/my-submissions" className="btn btn-ghost btn-sm">View all my submissions</Link>
        </div>

        {/* Nearby Challenges */}
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
                    <span className={`badge ${STATUS_BADGE[s.status] || 'badge-submitted'}`}>{s.status}</span>
                  </div>
                  <div className={styles.submissionMeta}>
                    <span className="tag tag-accent">{s.domain}</span>
                    <span className="text-xs text-tertiary">{s.district}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
