'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/authContext'
import { Submission } from '@/lib/mockData'
import SubmissionCard from '@/components/SubmissionCard'
import FilterBar, { DEFAULT_FILTERS, applyFilters } from '@/components/FilterBar'
import Modal from '@/components/Modal'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

export default function MySubmissionsPage() {
  const { user } = useAuth()
  const { state, submitVerification } = useStore()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [verifyModal, setVerifyModal] = useState(false)
  const [verified, setVerified] = useState(false)

  // In demo, first 3 submissions belong to the citizen
  const mine = state.submissions.slice(0, 3)
  const filtered = applyFilters(mine, filters)

  function handleVerify() {
    if (selected) {
      submitVerification(selected.id)
      setVerifyModal(false)
      setVerified(true)
      setSelected({ ...selected, status: 'Resolved' })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Submissions</h1>
          <p className={styles.subtitle}>All challenges you have submitted to the portal.</p>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showDistrict={false} />

      <div className={styles.layout}>
        {/* List */}
        <div className={styles.list}>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-mark">0</div>
              <h5>No submissions match your filters</h5>
            </div>
          )}
          {filtered.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={s}
              onClick={() => { setSelected(s); setVerified(false) }}
              actions={
                <>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(s); setVerified(false) }}>
                    View Details
                  </button>
                  {s.status === 'Pending Verification' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); setSelected(s); setVerifyModal(true) }}
                    >
                      Submit Verification
                    </button>
                  )}
                </>
              }
            />
          ))}
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

              {selected.assignedInstitution && (
                <div className={styles.drawerSection}>
                  <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Assigned Institution</span>
                  <p className="text-sm font-semibold mt-2">{selected.assignedInstitution}</p>
                  {selected.fitScore && (
                    <div className={styles.fitBar}>
                      <span className="text-xs text-secondary">AI Fit Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-bar-fill fill-dark" style={{ width: `${selected.fitScore * 100}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{Math.round(selected.fitScore * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.drawerSection}>
                <span className="text-xs text-tertiary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Submitted</span>
                <p className="text-sm mt-2">{new Date(selected.submittedAt).toLocaleString('en-IN')}</p>
              </div>

              {selected.status === 'Pending Verification' && !verified && (
                <div className={styles.verifyAlert}>
                  <p className="text-sm font-semibold text-ai-800">Action Required</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--ai-700)' }}>
                    This challenge has been addressed. Please submit a geo-tagged photo to confirm resolution and close the case.
                  </p>
                  <button className="btn btn-primary btn-sm mt-4" onClick={() => setVerifyModal(true)}>
                    Submit Verification Photo
                  </button>
                </div>
              )}

              {verified && (
                <div className={styles.resolvedBanner}>
                  <p className="text-sm font-semibold">Marked as Resolved</p>
                  <p className="text-xs mt-1">Your verification has been recorded. Thank you.</p>
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
            <button className="btn btn-primary btn-sm" onClick={handleVerify}>Confirm Resolution</button>
          </>
        }
      >
        <p className="text-sm text-secondary mb-5">
          By proceeding, you confirm that the issue has been addressed on the ground. A geo-tagged, time-stamped record will be created.
        </p>
        <div className="form-group">
          <label className="form-label">Upload Verification Photo</label>
          <input type="file" className="form-input" accept="image/*" />
          <span className="form-hint">JPEG or PNG, max 5 MB. Must show the resolved site.</span>
        </div>
        <div className="form-group">
          <label className="form-label">Location (auto-detected)</label>
          <input type="text" className="form-input" value="Lat: 23.8000, Lng: 84.0700" readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Comments (optional)</label>
          <textarea className="form-textarea" placeholder="Describe what was fixed..." />
        </div>
      </Modal>
    </div>
  )
}
