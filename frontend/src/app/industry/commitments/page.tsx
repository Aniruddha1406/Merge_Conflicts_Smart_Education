'use client'

import { useState, Fragment } from 'react'
import { useStore } from '@/lib/store'
import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import Modal from '@/components/Modal'
import styles from './page.module.css'

export default function CommitmentsPage() {
  const { state, disburseFunds } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [disburseModal, setDisburseModal] = useState<string | null>(null)
  const [disburseAmount, setDisburseAmount] = useState<number>(0)

  const partner = INDUSTRY_PARTNERS[0]
  const myCommitments = state.commitments.filter(c => c.partnerId === partner.id)

  const totalCommitted = myCommitments.reduce((s, c) => s + c.amountLakhs, 0)
  const totalDisbursed = myCommitments.reduce((s, c) => s + c.disbursedLakhs, 0)

  function handleDisburse() {
    if (!disburseModal || disburseAmount <= 0) return
    const commitment = myCommitments.find(c => c.id === disburseModal)
    if (!commitment) return
    
    // Validate amount
    const remaining = commitment.amountLakhs - commitment.disbursedLakhs
    if (disburseAmount > remaining) {
      alert(`Cannot disburse more than the remaining committed amount (₹${remaining}L).`)
      return
    }

    disburseFunds(disburseModal, disburseAmount)
    setDisburseModal(null)
    setDisburseAmount(0)
  }

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
                <Fragment key={c.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
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
                        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
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
                          <button 
                            className="btn btn-primary btn-sm"
                            disabled={c.disbursedLakhs >= c.amountLakhs}
                            onClick={() => {
                              setDisburseModal(c.id)
                              setDisburseAmount(c.amountLakhs - c.disbursedLakhs) // Default to remaining amount
                            }}
                          >
                            Disburse Funds
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {myCommitments.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)' }}>No commitments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!disburseModal}
        onClose={() => setDisburseModal(null)}
        title="Disburse Funds"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setDisburseModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleDisburse}>Confirm Disbursement</button>
          </>
        }
      >
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
          Enter the amount you wish to disburse to the partner institution for milestone completion.
        </p>
        <div className="form-group">
          <label className="form-label">Disbursement Amount (in Lakhs)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-secondary font-medium">₹</span>
            <input 
              type="number" 
              className="form-input" 
              style={{ maxWidth: '150px' }}
              value={disburseAmount}
              onChange={e => setDisburseAmount(Number(e.target.value))}
              min={0}
              step={0.5}
            />
            <span className="text-secondary font-medium">L</span>
          </div>
          <span className="form-hint" style={{ marginTop: 'var(--space-2)' }}>
            Remaining committed funds: <strong>₹{myCommitments.find(c => c.id === disburseModal)?.amountLakhs! - myCommitments.find(c => c.id === disburseModal)?.disbursedLakhs!}L</strong>
          </span>
        </div>
      </Modal>
    </div>
  )
}
