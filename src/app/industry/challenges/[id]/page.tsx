'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import Link from 'next/link'
import Modal from '@/components/Modal'
import styles from './page.module.css'

import { createFundingCommitment } from '@/app/actions/projects'

export default function ChallengeDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { state, addCommitment } = useStore()
  const partner = INDUSTRY_PARTNERS[0]
  const sub = state.submissions.find(s => s.id === id)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'CSR' | 'Seed Grant' | 'Co-Development'>('CSR')
  const [coPi, setCoPi] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!sub) return (
    <div className="empty-state" style={{ padding: 'var(--space-20)' }}>
      <div className="empty-state-mark">?</div>
      <h5>Challenge not found</h5>
      <Link href="/industry/challenges" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-4)' }}>Back</Link>
    </div>
  )

  async function handleCommit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    await createFundingCommitment({
      challengeId: sub!.id,
      partnerId: partner.id,
      partnerName: partner.name,
      institutionName: sub!.assignedInstitution || undefined,
      amountLakhs: Number(amount),
      type: type as any,
    })
    addCommitment({
      id: `FC-${Date.now()}`,
      submissionId: sub!.id,
      submissionTitle: sub!.title,
      institution: sub!.assignedInstitution ?? 'Pending Assignment',
      partnerId: partner.id,
      amountLakhs: Number(amount),
      type,
      status: 'Active',
      disbursedLakhs: 0,
    })
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className={styles.page}>
      <Link href="/industry/challenges" className="btn btn-ghost btn-sm">← Browse Challenges</Link>

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className="card">
            <div className="card-header">
              <span className="text-xs text-tertiary">{sub.id}</span>
              <h1 className={styles.title}>{sub.title}</h1>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="tag tag-accent">{sub.domain}</span>
                <span className="tag">{sub.district}</span>
                <span className="badge badge-verification">Urgency: {sub.urgencyScore}</span>
              </div>
            </div>
            <div className="card-body">
              <p className="text-sm">{sub.description}</p>
              <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                <div><span className="text-xs text-secondary">Submitted By</span><p className="text-sm font-medium">{sub.submittedBy}</p></div>
                <div><span className="text-xs text-secondary">Date</span><p className="text-sm font-medium">{new Date(sub.submittedAt).toLocaleDateString('en-IN')}</p></div>
                <div><span className="text-xs text-secondary">Endorsements</span><p className="text-xl font-bold" style={{ color: 'var(--cf-800)' }}>{sub.endorsements}</p></div>
                {sub.assignedInstitution && <div><span className="text-xs text-secondary">Assigned HEI</span><p className="text-sm font-semibold">{sub.assignedInstitution} ({Math.round((sub.fitScore ?? 0) * 100)}% fit)</p></div>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          {submitted ? (
            <div className="card card-accent">
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <div className="empty-state-mark" style={{ borderColor: 'var(--ai-500)', color: 'var(--ai-600)', margin: '0 auto var(--space-4)' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--cf-800)', marginBottom: 'var(--space-3)' }}>Commitment Recorded</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-5)' }}>Your funding commitment has been logged and the institution notified.</p>
                <Link href="/industry/commitments" className="btn btn-primary btn-sm">View All Commitments</Link>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header"><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--cf-800)' }}>Commit Funding</h2></div>
              <form onSubmit={handleCommit}>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Amount (₹ Lakhs)</label>
                    <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} required min={1} placeholder="e.g. 20" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Funding Type</label>
                    <select className="form-select" value={type} onChange={e => setType(e.target.value as typeof type)}>
                      <option value="CSR">CSR Grant</option>
                      <option value="Seed Grant">Seed Grant</option>
                      <option value="Co-Development">Co-Development Agreement</option>
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={coPi} onChange={e => setCoPi(e.target.checked)} />
                    Request Co-Principal Investigator role
                  </label>
                </div>
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!amount}>Commit Funding</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
