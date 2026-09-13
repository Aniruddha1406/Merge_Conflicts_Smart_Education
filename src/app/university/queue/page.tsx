'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { ROUTING_RECOMMENDATIONS, SUBMISSIONS, INSTITUTIONS } from '@/lib/mockData'
import Modal from '@/components/Modal'
import Link from 'next/link'
import styles from './page.module.css'

type SortKey = 'fitScore' | 'urgency'

export default function UniversityQueuePage() {
  const { state, assign } = useStore()
  const [sort, setSort] = useState<SortKey>('fitScore')
  const [assignModal, setAssignModal] = useState<{ subId: string; institution: string; fitScore: number } | null>(null)
  const [mentor, setMentor] = useState('Prof. Anita Sharma')
  const [assigned, setAssigned] = useState<Set<string>>(new Set())

  // Build queue from routing recommendations
  const queue = useMemo(() => {
    return Object.entries(ROUTING_RECOMMENDATIONS).map(([subId, recs]) => {
      const sub = state.submissions.find(s => s.id === subId)
      const rec = recs[0] // top recommendation
      return { sub, rec, subId }
    }).filter(({ sub }) => sub && !assigned.has(sub.id))
  }, [state.submissions, assigned])

  const sorted = useMemo(() => [...queue].sort((a, b) => {
    if (sort === 'fitScore') return (b.rec.fitScore ?? 0) - (a.rec.fitScore ?? 0)
    return (b.sub?.urgencyScore ?? 0) - (a.sub?.urgencyScore ?? 0)
  }), [queue, sort])

  function handleConfirmAssign() {
    if (assignModal) {
      assign(assignModal.subId, assignModal.institution, assignModal.fitScore)
      setAssigned(prev => new Set(prev).add(assignModal.subId))
      setAssignModal(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Challenge Routing Queue</h1>
          <p className={styles.subtitle}>Challenges matched to your institution via semantic vector similarity. Review and accept to begin a project.</p>
        </div>
        <div className={styles.sortRow}>
          <span className="text-sm text-secondary">Sort by:</span>
          <button className={`btn btn-sm ${sort === 'fitScore' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSort('fitScore')}>Fit Score</button>
          <button className={`btn btn-sm ${sort === 'urgency' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSort('urgency')}>Urgency</button>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-mark">0</div>
          <h5>No pending challenges in queue</h5>
          <p>All routed challenges have been accepted or declined.</p>
        </div>
      )}

      <div className={styles.queueList}>
        {sorted.map(({ sub, rec, subId }) => sub ? (
          <div className="card" key={subId}>
            <div className="card-header">
              <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                  <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>{sub.id}</span>
                  <h3 className={styles.cardTitle}>{sub.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="tag tag-accent">{sub.domain}</span>
                    <span className="tag">{sub.district}</span>
                    <span className="badge badge-verification">Urgency: {sub.urgencyScore}</span>
                  </div>
                </div>
                <div className={styles.fitBlock}>
                  <span className="text-xs text-secondary">AI Fit Score</span>
                  <div className={styles.fitScore}>{Math.round(rec.fitScore * 100)}%</div>
                  <div className="progress-bar">
                    <div className={`progress-bar-fill ${rec.fitScore >= 0.85 ? 'fill-dark' : ''}`} style={{ width: `${rec.fitScore * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>{sub.description}</p>
              <div className={styles.matchBasis}>
                <span className="text-xs font-semibold text-secondary">Matched on:</span>
                {rec.matchBasis.map(b => <span key={b} className="tag">{b}</span>)}
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href={`/university/queue/${sub.id}`} className="btn btn-ghost btn-sm">Full Details</Link>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setAssigned(prev => new Set(prev).add(sub.id))}>Decline</button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setAssignModal({ subId: sub.id, institution: rec.institution.shortName, fitScore: rec.fitScore })}
                >
                  Accept & Assign Team
                </button>
              </div>
            </div>
          </div>
        ) : null)}
      </div>

      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Accept Challenge & Assign Team"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleConfirmAssign}>Confirm Assignment</button>
          </>
        }
      >
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-5)' }}>
          Accepting this challenge will formally assign it to <strong>{assignModal?.institution}</strong> and notify the Government Admin portal.
        </p>
        <div className="form-group">
          <label className="form-label">Faculty Mentor</label>
          <select className="form-select" value={mentor} onChange={e => setMentor(e.target.value)}>
            <option>Prof. Anita Sharma</option>
            <option>Dr. Meena Toppo</option>
            <option>Prof. R.K. Singh</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Initial Student Team (select)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {['Ravi Kumar (M.Tech III)', 'Priya Ekka (M.Tech II)', 'Deepak Nath (B.Tech IV)'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                <input type="checkbox" defaultChecked />
                {s}
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
