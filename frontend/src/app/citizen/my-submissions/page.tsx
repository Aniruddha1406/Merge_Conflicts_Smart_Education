'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/authContext'
import { getChallengesByUser, submitVerification } from '@/app/actions/challenges'
import Modal from '@/components/Modal'
import Link from 'next/link'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Validated': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
  'Rejected': 'badge-submitted',
}

// Status order for timeline rendering
const STATUS_ORDER = ['Submitted', 'Validated', 'Assigned to Institution', 'In Progress', 'Pending Verification', 'Resolved']

interface DbRow {
  id: string
  title: string
  description: string
  domain: string
  district: string
  block?: string | null
  village?: string | null
  submitted_by_name: string
  submitted_at: string
  status: string
  endorsements: number
  urgency_score: number
  assigned_institution_name?: string | null
  fit_score?: number | null
  ai_category?: string | null
  ai_subcategory?: string | null
  ai_triage?: string | null
  ai_technical_core?: string | null
  updated_at?: string
}

export default function MySubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<DbRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DbRow | null>(null)
  const [verifyModal, setVerifyModal] = useState(false)
  const [verifyComments, setVerifyComments] = useState('')
  const [submittingVerify, setSubmittingVerify] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const rows = await getChallengesByUser(user.id)
      setSubmissions(rows as DbRow[])
    } catch (e) {
      console.error('Failed to load submissions', e)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  async function handleVerify() {
    if (!selected || !user) return
    setSubmittingVerify(true)
    try {
      await submitVerification(selected.id, user.id, { comments: verifyComments })
      setVerifyModal(false)
      setVerifyComments('')
      await loadData()
      setSelected(null)
    } catch (e) {
      alert('Verification failed: ' + String(e))
    }
    setSubmittingVerify(false)
  }

  function getStatusIndex(status: string) {
    const idx = STATUS_ORDER.indexOf(status)
    return idx >= 0 ? idx : 0
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Submissions</h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Loading your submissions from database...'
              : `${submissions.length} challenge(s) submitted by ${user?.name || 'you'}`}
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* List */}
        <div className={styles.list}>
          {!loading && submissions.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-mark">0</div>
              <h5>No submissions yet</h5>
              <p className="text-sm text-secondary">Submit your first challenge to see it here.</p>
              <Link href="/citizen/submit" className="btn btn-primary btn-sm mt-4">Submit a Challenge</Link>
            </div>
          )}
          {submissions.map((s) => {
            const statusIdx = getStatusIndex(s.status)
            return (
              <div
                key={s.id}
                className="card"
                style={{ cursor: 'pointer', marginBottom: 'var(--space-3)' }}
                onClick={() => setSelected(s)}
              >
                <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="text-xs text-tertiary font-medium">{s.id}</span>
                      <h3 className="text-base font-semibold" style={{ color: 'var(--cf-800)', margin: '0.25rem 0' }}>{s.title}</h3>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="tag tag-accent text-xs">{s.domain}</span>
                        <span className="text-xs text-secondary">{s.district}{s.village ? `, ${s.village}` : ''}</span>
                        <span className="text-xs text-secondary">Urgency: {s.urgency_score}</span>
                      </div>
                    </div>
                    <span className={`badge ${STATUS_BADGE[s.status] || 'badge-submitted'}`}>{s.status}</span>
                  </div>

                  {/* Mini Timeline */}
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginTop: 'var(--space-3)' }}>
                    {STATUS_ORDER.map((step, i) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: i <= statusIdx ? 'var(--cf-600)' : '#E5E0D8',
                        }} />
                        {i < STATUS_ORDER.length - 1 && (
                          <div style={{
                            width: '16px', height: '2px',
                            background: i < statusIdx ? 'var(--cf-600)' : '#E5E0D8',
                          }} />
                        )}
                      </div>
                    ))}
                    <span className="text-xs text-secondary" style={{ marginLeft: '0.5rem' }}>
                      {STATUS_ORDER[statusIdx]}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{selected.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerSection}>
                <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Status</span>
                <span className={`badge ${STATUS_BADGE[selected.status]} mt-2`}>{selected.status}</span>
              </div>

              <div className={styles.drawerSection}>
                <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Description</span>
                <p className="text-sm mt-2">{selected.description}</p>
              </div>

              <div className={styles.drawerSection}>
                <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Location</span>
                <p className="text-sm mt-2">{selected.district}{selected.village ? `, ${selected.village}` : ''}</p>
              </div>

              {selected.assigned_institution_name && (
                <div className={styles.drawerSection}>
                  <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Assigned Institution</span>
                  <p className="text-sm font-semibold mt-2">{selected.assigned_institution_name}</p>
                  {selected.fit_score && (
                    <div className={styles.fitBar}>
                      <span className="text-xs text-secondary">AI Fit Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-bar-fill fill-dark" style={{ width: `${selected.fit_score * 100}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{Math.round(selected.fit_score * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.drawerSection}>
                <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Submitted</span>
                <p className="text-sm mt-2">{new Date(selected.submitted_at).toLocaleString('en-IN')}</p>
              </div>

              {/* Full Lifecycle Timeline */}
              <div className={styles.drawerSection}>
                <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)', marginBottom: 'var(--space-2)', display: 'block' }}>Lifecycle Timeline</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {STATUS_ORDER.map((step, i) => {
                    const isActive = i <= getStatusIndex(selected.status)
                    const isCurrent = step === selected.status
                    return (
                      <div key={step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '12px', height: '12px', borderRadius: '50%', marginTop: '3px', flexShrink: 0,
                          background: isActive ? (isCurrent ? 'var(--cf-600)' : 'var(--cf-400)') : '#E5E0D8',
                          border: isCurrent ? '2px solid var(--cf-800)' : 'none',
                        }} />
                        <div>
                          <p className="text-sm" style={{ fontWeight: isCurrent ? 600 : 400, color: isActive ? 'var(--cf-800)' : 'var(--text-tertiary)' }}>
                            {step}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selected.status === 'Pending Verification' && (
                <div className={styles.verifyAlert}>
                  <p className="text-sm font-semibold text-ai-800">Action Required</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--ai-700)' }}>
                    This challenge has been addressed. Please submit verification to confirm resolution.
                  </p>
                  <button className="btn btn-primary btn-sm mt-4" onClick={() => setVerifyModal(true)}>
                    Submit Verification
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <Modal
        open={verifyModal}
        onClose={() => setVerifyModal(false)}
        title="Submit Proof of Impact"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setVerifyModal(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" disabled={submittingVerify} onClick={handleVerify}>
              {submittingVerify ? 'Submitting...' : 'Confirm Resolution'}
            </button>
          </>
        }
      >
        <p className="text-sm text-secondary mb-5">
          By proceeding, you confirm that the issue has been addressed on the ground.
        </p>
        <div className="form-group">
          <label className="form-label">Comments (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Describe what was fixed..."
            value={verifyComments}
            onChange={e => setVerifyComments(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
