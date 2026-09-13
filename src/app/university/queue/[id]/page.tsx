'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ROUTING_RECOMMENDATIONS } from '@/lib/mockData'
import Link from 'next/link'
import { useState } from 'react'
import styles from './page.module.css'

export default function QueueDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { state, assign } = useStore()

  const sub = state.submissions.find(s => s.id === id)
  const recs = ROUTING_RECOMMENDATIONS[id] ?? []
  const [submitted, setSubmitted] = useState(false)
  const [mentor, setMentor] = useState('Prof. Anita Sharma')

  if (!sub) return (
    <div className="empty-state" style={{ padding: 'var(--space-20)' }}>
      <div className="empty-state-mark">?</div>
      <h5>Challenge not found</h5>
      <Link href="/university/queue" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-4)' }}>Back to Queue</Link>
    </div>
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const top = recs[0]
    if (top) assign(sub!.id, top.institution.shortName, top.fitScore)
    setSubmitted(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/university/queue" className="btn btn-ghost btn-sm">← Back to Queue</Link>
      </div>

      <div className={styles.layout}>
        {/* Left: challenge info */}
        <div className={styles.left}>
          <div className="card">
            <div className="card-header">
              <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>{sub.id}</span>
              <h1 className={styles.title}>{sub.title}</h1>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="tag tag-accent">{sub.domain}</span>
                <span className="tag">{sub.district}</span>
                {sub.village && <span className="tag">{sub.village}</span>}
                <span className="badge badge-verification">Urgency: {sub.urgencyScore}</span>
              </div>
            </div>
            <div className="card-body">
              <p className="text-sm">{sub.description}</p>
              <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <span className="text-xs text-secondary">Endorsements</span>
                  <p className="text-xl font-bold" style={{ color: 'var(--cf-800)' }}>{sub.endorsements}</p>
                </div>
                <div>
                  <span className="text-xs text-secondary">Submitted</span>
                  <p className="text-sm font-medium">{new Date(sub.submittedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-xs text-secondary">Submitted By</span>
                  <p className="text-sm font-medium">{sub.submittedBy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Routing Breakdown */}
          <div className="card" style={{ marginTop: 'var(--space-5)' }}>
            <div className="card-header">
              <h2 className={styles.sectionTitle}>AI Routing Recommendations</h2>
            </div>
            <div className="card-body">
              <div className={styles.recList}>
                {recs.map((rec, i) => (
                  <div key={rec.institution.id} className={styles.recItem}>
                    <div className={styles.recRank}>#{i + 1}</div>
                    <div className={styles.recInfo}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-base font-semibold" style={{ color: 'var(--cf-800)' }}>{rec.institution.shortName}</span>
                        <span className="text-xl font-bold" style={{ color: i === 0 ? 'var(--cf-800)' : 'var(--ai-700)' }}>
                          {Math.round(rec.fitScore * 100)}%
                        </span>
                      </div>
                      <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                        <div className={`progress-bar-fill ${i === 0 ? 'fill-dark' : ''}`} style={{ width: `${rec.fitScore * 100}%` }} />
                      </div>
                      <div className={styles.matchBasis}>
                        {rec.matchBasis.map(b => <span key={b} className="tag">{b}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: assignment form */}
        <div className={styles.right}>
          {submitted ? (
            <div className="card card-accent">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <div className="empty-state-mark" style={{ borderColor: 'var(--ai-500)', color: 'var(--ai-600)', margin: '0 auto var(--space-4)' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--cf-800)', marginBottom: 'var(--space-3)' }}>Challenge Accepted</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-5)' }}>
                  The challenge has been formally assigned and the Government Admin has been notified.
                </p>
                <Link href="/university/projects" className="btn btn-primary btn-sm">Go to Active Projects</Link>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2 className={styles.sectionTitle}>Accept & Form Team</h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assigning to Institution</label>
                    <input className="form-input" value={recs[0]?.institution.shortName ?? 'BIT Mesra'} readOnly style={{ background: 'var(--warm-50)' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Faculty Mentor</label>
                    <select className="form-select" value={mentor} onChange={e => setMentor(e.target.value)}>
                      <option>Prof. Anita Sharma</option>
                      <option>Dr. Meena Toppo</option>
                      <option>Prof. R.K. Singh</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Initial Student Team</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {['Ravi Kumar (M.Tech III)', 'Priya Ekka (M.Tech II)', 'Deepak Nath (B.Tech IV)'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                          <input type="checkbox" defaultChecked />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expected Project Duration</label>
                    <select className="form-select">
                      <option>3 months</option>
                      <option>6 months</option>
                      <option>12 months</option>
                    </select>
                  </div>
                </div>
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <Link href="/university/queue" className="btn btn-outline btn-sm">Decline</Link>
                  <button type="submit" className="btn btn-primary btn-sm">Accept Challenge</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
