'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/authContext'
import { useStore } from '@/lib/store'
import { INSTITUTIONS, ROUTING_RECOMMENDATIONS, SUBMISSIONS } from '@/lib/mockData'
import Link from 'next/link'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Planning': 'badge-submitted',
  'Active': 'badge-inprogress',
  'Testing': 'badge-assigned',
  'Completed': 'badge-resolved',
  'Stalled': 'badge-review',
}

export default function UniversityDashboard() {
  const { user } = useAuth()
  const { state } = useStore()

  const inst = INSTITUTIONS[0] // BIT Mesra demo

  // Live from store
  const activeProjects = state.projects.filter(p => p.status === 'Active')
  const allProjects = state.projects

  const totalHours = useMemo(() =>
    allProjects.flatMap(p => p.milestones.filter(m => m.completed)).reduce((s, m) => s + m.studentHours, 0),
    [allProjects]
  )
  const abcCredits = Math.round(totalHours / 30)

  // Queue from ROUTING_RECOMMENDATIONS (top 3)
  const queue = Object.keys(ROUTING_RECOMMENDATIONS).map(subId => {
    const sub = SUBMISSIONS.find(s => s.id === subId)
    const rec = ROUTING_RECOMMENDATIONS[subId].find(r => r.institution.id === inst.id)
    return { sub, rec }
  }).filter(i => i.sub && i.rec).slice(0, 3)

  return (
    <div className={styles.page}>
      {/* Institution Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.instIcon}>{inst.shortName[0]}</div>
          <div>
            <h1 className={styles.pageTitle}>{inst.shortName}</h1>
            <p className={styles.pageSubtitle}>{inst.name} — {inst.location}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span className="tag">{inst.type}</span>
              {inst.incubationCenter && <span className="badge badge-resolved">Incubation Centre Active</span>}
              {inst.departments.slice(0, 3).map(d => <span key={d} className="tag">{d}</span>)}
            </div>
          </div>
        </div>
        <Link href="/university/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Challenges in Queue', value: Object.keys(ROUTING_RECOMMENDATIONS).length, sub: 'AI-routed to you' },
          { label: 'Active Projects', value: activeProjects.length, sub: `${allProjects.filter(p => p.status === 'Completed').length} completed` },
          { label: 'Student Hours Logged', value: totalHours, sub: 'across all projects' },
          { label: 'ABC Credits Generated', value: abcCredits, sub: `NEP 2020 compliant` },
        ].map(k => (
          <div className="stat-card" key={k.label}>
            <div className="stat-card-value">{k.value}</div>
            <div className="stat-card-label">{k.label}</div>
            <div className="stat-card-delta neutral">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Incoming Queue */}
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Incoming Challenge Queue</h2>
            <span className="badge badge-assigned">AI Routed</span>
          </div>
          <p className={styles.sectionHint}>Challenges matched to your institution via semantic expertise fit score.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {queue.map(({ sub, rec }) => sub && rec ? (
              <div className="card" key={sub.id}>
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="text-xs text-tertiary">{sub.id} — {sub.district}</span>
                      <h3 className={styles.challengeTitle}>{sub.title}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)', flexShrink: 0 }}>
                      <span className="text-xs text-secondary">Fit Score</span>
                      <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: rec.fitScore > 0.8 ? 'var(--cf-800)' : 'var(--ai-700)' }}>
                        {Math.round(rec.fitScore * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="progress-bar-fill fill-dark" style={{ width: `${rec.fitScore * 100}%` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="text-xs font-semibold text-secondary">Matched on:</span>
                    {rec.matchBasis.map(b => <span key={b} className="tag text-xs">{b}</span>)}
                  </div>
                </div>
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button className="btn btn-outline btn-sm">Decline</button>
                  <Link href={`/university/queue/${sub.id}`} className="btn btn-primary btn-sm">Review & Accept</Link>
                </div>
              </div>
            ) : null)}
            <Link href="/university/queue" className="btn btn-ghost btn-sm">View Full Queue</Link>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* NEP / ABC Card */}
          <div className="card card-accent">
            <div className="card-body">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--cf-800)', marginBottom: 'var(--space-3)' }}>
                NEP 2020 — ABC Compliance
              </h3>
              <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                Your institution has logged <strong>{totalHours} student hours</strong> this semester across <strong>{allProjects.length} projects</strong>, generating approximately <strong>{abcCredits} ABC credits</strong>.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Link href="/university/abc" className="btn btn-secondary btn-sm">Full ABC Report</Link>
                <Link href="/university/teams" className="btn btn-outline btn-sm">Team Roster</Link>
              </div>
            </div>
          </div>

          {/* Active Projects — all from store */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Projects</h2>
            <Link href="/university/projects" className="btn btn-ghost btn-sm">All</Link>
          </div>
          {allProjects.map(p => {
            const done = p.milestones.filter(m => m.completed).length
            const total = p.milestones.length
            const pct = Math.round((done / total) * 100)
            const next = p.milestones.find(m => !m.completed)
            return (
              <div className="card" key={p.id}>
                <div className="card-header" style={{ paddingBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="text-xs text-tertiary">{p.id}</span>
                      <h3 className={styles.projectTitle}>{p.title}</h3>
                      {p.industryPartner && (
                        <p className="text-xs text-secondary" style={{ marginTop: 'var(--space-1)' }}>Industry: {p.industryPartner}</p>
                      )}
                    </div>
                    <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                  </div>
                </div>
                <div className="card-body" style={{ paddingTop: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span className="text-xs text-secondary">Progress — {done}/{total} milestones</span>
                    <span className="text-xs font-semibold">{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="progress-bar-fill fill-dark" style={{ width: `${pct}%` }} />
                  </div>
                  {next && (
                    <p className="text-xs text-secondary">
                      Next: <strong>{next.title}</strong> — Due {new Date(next.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <div className="card-footer">
                  <Link href={`/university/projects/${p.id}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Manage Project
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
