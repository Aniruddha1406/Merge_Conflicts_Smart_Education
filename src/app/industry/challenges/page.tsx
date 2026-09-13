'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import FilterBar, { DEFAULT_FILTERS, applyFilters } from '@/components/FilterBar'
import Modal from '@/components/Modal'
import Link from 'next/link'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

export default function IndustryChallengesPage() {
  const { state, addCommitment } = useStore()
  const partner = INDUSTRY_PARTNERS[0]
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, status: 'All Statuses' })
  const [commitModal, setCommitModal] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'CSR' | 'Seed Grant' | 'Co-Development'>('CSR')
  const [committed, setCommitted] = useState<Set<string>>(new Set())
  const [success, setSuccess] = useState(false)

  const filtered = useMemo(() =>
    applyFilters(
      state.submissions.filter(s => !committed.has(s.id) && s.status !== 'Resolved'),
      filters
    ),
    [state.submissions, filters, committed]
  )

  const commitSub = state.submissions.find(s => s.id === commitModal)

  function handleCommit() {
    if (!commitModal || !amount) return
    const sub = state.submissions.find(s => s.id === commitModal)
    addCommitment({
      id: `FC-${Date.now()}`,
      submissionId: commitModal,
      submissionTitle: sub?.title ?? '',
      institution: sub?.assignedInstitution ?? 'Pending Assignment',
      partnerId: partner.id,
      amountLakhs: Number(amount),
      type,
      status: 'Active',
      disbursedLakhs: 0,
    })
    setCommitted(p => new Set(p).add(commitModal))
    setCommitModal(null)
    setAmount('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Browse Open Challenges</h1>
          <p className={styles.subtitle}>Filtered by your CSR focus areas: {partner.csrFocusAreas.join(', ')}</p>
        </div>
      </div>

      {success && (
        <div className={styles.successBanner}>
          Funding commitment recorded. It will appear in your Commitments dashboard.
        </div>
      )}

      <FilterBar filters={filters} onChange={setFilters} showStatus={false} />

      <div className={styles.grid}>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-mark">0</div>
            <h5>No open challenges match your filters</h5>
          </div>
        )}
        {filtered.map(s => (
          <div className="card" key={s.id}>
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <div>
                  <span className="text-xs text-tertiary">{s.id}</span>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                </div>
                <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>
              </div>
            </div>
            <div className="card-body">
              <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {s.description}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                <span className="tag tag-accent">{s.domain}</span>
                <span className="tag">{s.district}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-verification">Urgency: {s.urgencyScore}</span>
                <span className="text-xs text-secondary">{s.endorsements} endorsements</span>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <Link href={`/industry/challenges/${s.id}`} className="btn btn-outline btn-sm">Full Details</Link>
              <button className="btn btn-secondary btn-sm" onClick={() => setCommitModal(s.id)}>
                Commit Funding
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!commitModal}
        onClose={() => setCommitModal(null)}
        title="Commit Funding & Mentorship"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setCommitModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleCommit} disabled={!amount}>
              Confirm Commitment
            </button>
          </>
        }
      >
        {commitSub && (
          <>
            <div style={{ padding: 'var(--space-3)', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', border: '1px solid var(--border-light)' }}>
              <p className="text-xs text-secondary">Challenge</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{commitSub.title}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Commitment Amount (₹ Lakhs)</label>
              <input type="number" className="form-input" placeholder="e.g. 25" value={amount} onChange={e => setAmount(e.target.value)} min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Funding Type</label>
              <select className="form-select" value={type} onChange={e => setType(e.target.value as typeof type)}>
                <option value="CSR">CSR Grant</option>
                <option value="Seed Grant">Seed Grant</option>
                <option value="Co-Development">Co-Development Agreement</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mentorship Commitment</label>
              <textarea className="form-textarea" defaultValue="Provide project management oversight and community engagement support." style={{ minHeight: '80px' }} />
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
