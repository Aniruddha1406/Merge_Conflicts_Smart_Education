'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import styles from './page.module.css'

export default function CommitmentsPage() {
  const { state } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const partner = INDUSTRY_PARTNERS[0]
  const myCommitments = state.commitments.filter(c => c.partnerId === partner.id)

  const totalCommitted = myCommitments.reduce((s, c) => s + c.amountLakhs, 0)
  const totalDisbursed = myCommitments.reduce((s, c) => s + c.disbursedLakhs, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Funding Commitments</h1>
          <p className={styles.subtitle}>All active and completed funding commitments by your organisation.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-value">₹{totalCommitted}L</div>
          <div className="stat-card-label">Total Committed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">₹{totalDisbursed}L</div>
          <div className="stat-card-label">Total Disbursed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{myCommitments.length}</div>
          <div className="stat-card-label">Active Commitments</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Challenge</th>
                <th>Institution</th>
                <th>Type</th>
                <th>Committed</th>
                <th>Disbursed</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myCommitments.map(c => (
                <>
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    <td style={{ fontWeight: 500, color: 'var(--cf-800)', maxWidth: '280px' }} className="text-sm">{c.submissionTitle}</td>
                    <td>{c.institution}</td>
                    <td><span className="tag">{c.type}</span></td>
                    <td className="font-semibold">₹{c.amountLakhs}L</td>
                    <td>₹{c.disbursedLakhs}L</td>
                    <td><span className={`badge ${c.status === 'Active' ? 'badge-inprogress' : 'badge-resolved'}`}>{c.status}</span></td>
                    <td className="text-xs text-secondary">{expanded === c.id ? '▲' : '▼'}</td>
                  </tr>
                  {expanded === c.id && (
                    <tr key={c.id + '-exp'}>
                      <td colSpan={7} style={{ background: 'var(--warm-50)', padding: 'var(--space-5) var(--space-6)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div>
                            <span className="text-xs text-secondary">Disbursement Rate</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                              <div className="progress-bar" style={{ width: '180px' }}>
                                <div className="progress-bar-fill fill-navy" style={{ width: `${(c.disbursedLakhs / c.amountLakhs) * 100}%` }} />
                              </div>
                              <span className="text-sm font-semibold">{Math.round((c.disbursedLakhs / c.amountLakhs) * 100)}%</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-secondary">Submission ID</span>
                            <p className="text-sm font-medium">{c.submissionId}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {myCommitments.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)' }}>No commitments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
