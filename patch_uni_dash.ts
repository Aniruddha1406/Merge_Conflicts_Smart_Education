import fs from 'fs'

const file = 'src/app/university/page.tsx'
const newContent = `'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/authContext'
import { getAssignableChallenges } from '@/app/actions/challenges'
import { getAllProjects } from '@/app/actions/projects'
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
  const [queue, setQueue] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Use the institution ID from auth if available, fallback to demo INST-001
  const instId = user?.institution?.id || 'INST-001'
  const instName = user?.institution?.name || 'Birla Institute of Technology'
  const instShortName = user?.institution?.shortName || 'BIT Mesra'
  const instLocation = user?.institution?.location || 'Ranchi, Jharkhand'

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [q, p] = await Promise.all([
        getAssignableChallenges(instId),
        getAllProjects() // ideally getProjectsByInstitution(instId) but we'll filter client-side for now
      ])
      
      setQueue(q.slice(0, 3)) // Top 3 queue
      setProjects(p.filter((x: any) => x.institution_id === instId))
    } catch (e) {
      console.error('Failed to load university data', e)
    }
    setLoading(false)
  }, [instId])

  useEffect(() => { loadData() }, [loadData])

  const activeProjects = projects.filter(p => p.status === 'Active')
  
  const totalHours = useMemo(() =>
    projects.flatMap(p => p.milestones?.filter((m: any) => m.completed) || []).reduce((s, m) => s + (m.student_hours || m.studentHours || 0), 0),
    [projects]
  )
  const abcCredits = Math.round(totalHours / 30)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <h1 className={styles.pageTitle}>Loading DB Data...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Institution Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.instIcon}>{instShortName[0]}</div>
          <div>
            <h1 className={styles.pageTitle}>{instShortName}</h1>
            <p className={styles.pageSubtitle}>{instName} — {instLocation}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span className="tag">Deemed University</span>
              <span className="badge badge-resolved">Incubation Centre Active</span>
            </div>
          </div>
        </div>
        <Link href="/university/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
      </div>

      {/* KPI Row */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Challenges in Queue', value: queue.length, sub: 'AI-routed to you (Live)' },
          { label: 'Active Projects', value: activeProjects.length, sub: \`\${projects.filter(p => p.status === 'Completed').length} completed (Live)\` },
          { label: 'Student Hours Logged', value: totalHours, sub: 'across all projects' },
          { label: 'ABC Credits Generated', value: abcCredits, sub: \`NEP 2020 compliant\` },
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
            {queue.map(sub => (
              <div className="card" key={sub.id}>
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="text-xs text-tertiary">{sub.id} — {sub.district}</span>
                      <h3 className={styles.challengeTitle}>{sub.title}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)', flexShrink: 0 }}>
                      <span className="text-xs text-secondary">Fit Score</span>
                      <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: (sub.fit_score ?? 0) > 0.8 ? 'var(--cf-800)' : 'var(--ai-700)' }}>
                        {Math.round((sub.fit_score ?? 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="progress-bar-fill fill-dark" style={{ width: \`\${(sub.fit_score ?? 0) * 100}%\` }} />
                  </div>
                </div>
                <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button className="btn btn-outline btn-sm">Decline</button>
                  <Link href={\`/university/queue/\${sub.id}\`} className="btn btn-primary btn-sm">Review & Accept</Link>
                </div>
              </div>
            ))}
            {queue.length === 0 && (
              <p className="text-sm text-secondary p-4 bg-white rounded-md border border-gray-200">No challenges in your queue right now.</p>
            )}
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
                Your institution has logged <strong>{totalHours} student hours</strong> this semester across <strong>{projects.length} projects</strong>, generating approximately <strong>{abcCredits} ABC credits</strong>.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Link href="/university/abc" className="btn btn-secondary btn-sm">Full ABC Report</Link>
                <Link href="/university/teams" className="btn btn-outline btn-sm">Team Roster</Link>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Projects</h2>
            <Link href="/university/projects" className="btn btn-ghost btn-sm">All</Link>
          </div>
          {projects.map(p => {
            const ms = p.milestones || []
            const done = ms.filter((m: any) => m.completed).length
            const total = ms.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const next = ms.find((m: any) => !m.completed)
            return (
              <div className="card" key={p.id}>
                <div className="card-header" style={{ paddingBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="text-xs text-tertiary">{p.id}</span>
                      <h3 className={styles.projectTitle}>{p.title}</h3>
                      {p.industry_partner_name && (
                        <p className="text-xs text-secondary" style={{ marginTop: 'var(--space-1)' }}>Industry: {p.industry_partner_name}</p>
                      )}
                    </div>
                    <span className={\`badge \${STATUS_BADGE[p.status]}\`}>{p.status}</span>
                  </div>
                </div>
                <div className="card-body" style={{ paddingTop: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span className="text-xs text-secondary">Progress — {done}/{total} milestones</span>
                    <span className="text-xs font-semibold">{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="progress-bar-fill fill-dark" style={{ width: \`\${pct}%\` }} />
                  </div>
                  {next && (
                    <p className="text-xs text-secondary">
                      Next: <strong>{next.title}</strong> — Due {new Date(next.due_date).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <div className="card-footer">
                  <Link href={\`/university/projects/\${p.id}\`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Manage Project
                  </Link>
                </div>
              </div>
            )
          })}
          {projects.length === 0 && (
             <p className="text-sm text-secondary p-4 bg-white rounded-md border border-gray-200">No active projects yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
`

fs.writeFileSync(file, newContent, 'utf8')
console.log('REPLACED')
