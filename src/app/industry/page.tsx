'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/authContext'
import { useStore } from '@/lib/store'
import { INDUSTRY_PARTNERS, SUBMISSIONS, OUTCOME_METRICS } from '@/lib/mockData'
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

export default function IndustryDashboard() {
  const { user } = useAuth()
  const { state } = useStore()

  const partner = INDUSTRY_PARTNERS[0] // Tata Projects CSR for demo

  // Live commitment stats from store
  const myCommitments = state.commitments.filter(c => c.partnerId === partner.id)
  const totalCommitted = myCommitments.reduce((s, c) => s + c.amountLakhs, 0) || partner.totalFundingCrore * 100
  const totalDisbursed = myCommitments.reduce((s, c) => s + c.disbursedLakhs, 0) || 125
  const disbursePct = Math.round((totalDisbursed / totalCommitted) * 100)

  // Districts impacted (from submissions linked to commitments)
  const impactedDistricts = new Set(
    myCommitments.map(c => state.submissions.find(s => s.id === c.submissionId)?.district).filter(Boolean)
  ).size || 4

  // Open challenges: fix the broken filter — show ALL non-resolved challenges in partner focus areas
  const openChallenges = SUBMISSIONS
    .filter(s => partner.csrFocusAreas.includes(s.domain) && s.status !== 'Resolved')
    .slice(0, 4)

  // Co-dev projects
  const codevelopment = state.projects.filter(p => p.industryPartner === partner.name)

  return (
    <div className={styles.page}>
      {/* Partner Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.partnerIcon}>{partner.name[0]}</div>
          <div>
            <h1 className={styles.pageTitle}>{partner.name}</h1>
            <p className={styles.pageSubtitle}>{partner.sector}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>CSR Focus:</span>
              {partner.csrFocusAreas.map(a => <span key={a} className="tag">{a}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.budgetWidget}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Budget Utilisation</span>
          <div className={styles.budgetPct}>{disbursePct}%</div>
          <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="progress-bar-fill" style={{ width: `${disbursePct}%`, background: 'var(--ai-400)' }} />
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>₹{totalDisbursed}L of ₹{totalCommitted}L disbursed</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Total Committed', value: `₹${totalCommitted}L`, sub: 'across SICP projects' },
          { label: 'Total Disbursed', value: `₹${totalDisbursed}L`, sub: `${disbursePct}% utilisation` },
          { label: 'Active Commitments', value: myCommitments.length || partner.activeCommitments, sub: 'live on platform' },
          { label: 'IPs & Patents Declared', value: OUTCOME_METRICS.patentsFiled, sub: `${OUTCOME_METRICS.patentsPending} pending` },
        ].map(k => (
          <div className="stat-card" key={k.label}>
            <div className="stat-card-value">{k.value}</div>
            <div className="stat-card-label">{k.label}</div>
            <div className="stat-card-delta neutral">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Open Challenges — FIXED filter */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Open Challenges in Your Focus Areas</h2>
            <Link href="/industry/challenges" className="btn btn-ghost btn-sm">Browse All</Link>
          </div>
          <p className={styles.sectionHint}>
            Matching: {partner.csrFocusAreas.join(', ')} — showing non-resolved challenges only.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {openChallenges.map(s => (
              <div className="card" key={s.id}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)', gap: 'var(--space-3)' }}>
                    <h3 className={styles.challengeTitle}>{s.title}</h3>
                    <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span className="tag tag-accent">{s.domain}</span>
                    <span className="tag">{s.district}</span>
                    <span className="badge badge-verification">Urgency: {s.urgencyScore}</span>
                  </div>
                  <p className="text-xs text-secondary" style={{ marginBottom: 'var(--space-4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.description}
                  </p>
                  <Link href={`/industry/challenges/${s.id}`} className="btn btn-outline btn-sm">View & Commit Funding</Link>
                </div>
              </div>
            ))}
            {openChallenges.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-mark">0</div>
                <h5>No open challenges match your focus areas</h5>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Commitments + CSR Impact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Active Commitments — live */}
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Commitments</h2>
              <Link href="/industry/commitments" className="btn btn-ghost btn-sm">All</Link>
            </div>
            {myCommitments.length === 0 ? (
              <div className="card">
                <div className="card-body">
                  <p className="text-sm text-secondary">No commitments yet. Browse challenges and commit funding to get started.</p>
                </div>
              </div>
            ) : (
              myCommitments.map(c => (
                <div className="card" key={c.id} style={{ marginBottom: 'var(--space-4)' }}>
                  <div className="card-body">
                    <h3 className={styles.commitTitle}>{c.submissionTitle}</h3>
                    <p className="text-xs text-secondary" style={{ marginBottom: 'var(--space-3)' }}>Partner: {c.institution}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span className="text-xs text-secondary">Disbursed — ₹{c.disbursedLakhs}L / ₹{c.amountLakhs}L</span>
                      <span className="text-xs font-semibold">{Math.round((c.disbursedLakhs / c.amountLakhs) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill fill-navy" style={{ width: `${(c.disbursedLakhs / c.amountLakhs) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Co-development fallback card if no live commitments */}
            {myCommitments.length === 0 && codevelopment.length > 0 && codevelopment.map(p => (
              <div className="card" key={p.id} style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-body">
                  <h3 className={styles.commitTitle}>{p.title}</h3>
                  <p className="text-xs text-secondary" style={{ marginBottom: 'var(--space-3)' }}>Partner: {p.institution}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span className="text-xs text-secondary">Funding Disbursed — ₹12.5L / ₹30L</span>
                    <span className="text-xs font-semibold">41%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill fill-navy" style={{ width: '41%' }} />
                  </div>
                </div>
                <div className="card-footer">
                  <Link href="/industry/commitments" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Manage Commitment
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CSR Impact Snapshot */}
          <div className="card card-accent">
            <div className="card-header">
              <h2 className={styles.sectionTitle}>CSR Impact Snapshot</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                {[
                  { label: 'Challenges Supported', value: myCommitments.length || partner.activeCommitments },
                  { label: 'Districts Impacted', value: impactedDistricts },
                  { label: 'Student Teams Empowered', value: codevelopment.reduce((s, p) => s + p.team.filter(t => t.role === 'Student').length, 0) || 12 },
                  { label: 'Community Deployments', value: OUTCOME_METRICS.communityDeployments },
                ].map(i => (
                  <div key={i.label} style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--cf-800)' }}>{i.value}</div>
                    <div className="text-xs text-secondary">{i.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/industry/codevelopment" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-5)', width: '100%', justifyContent: 'center' }}>
                Co-Development Workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
