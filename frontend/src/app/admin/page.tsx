'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/authContext'
import { getDashboardData } from '@/app/actions/challenges'
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

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([getDashboardData(), getAllProjects()])
      setStats(s)
      setProjects(p)
    } catch (e) {
      console.error('Failed to load dashboard data from DB', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading || !stats) {
    return (
      <div className={styles.page}>
        <div className={styles.welcome}>
          <h1 className={styles.pageTitle}>Loading Dashboard from Database...</h1>
        </div>
      </div>
    )
  }

  const maxDomain = stats.submissionsByDomain[0]?.count || 1
  const topDistricts = stats.submissionsByDistrict.slice(0, 5)
  const maxDist = topDistricts[0]?.count || 1

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.pageTitle}>Government Administration Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Statewide analytics, challenge lifecycle management, and platform oversight — Government of Jharkhand.
          </p>
        </div>
        <div className={styles.welcomeMeta}>
          <span className="badge badge-assigned">NEP 2020 Aligned</span>
          <span className="text-xs text-secondary">Live DB Data</span>
        </div>
      </div>

      {/* ── KPI STRIP ROW 1 ── */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Total Submissions', value: stats.totalSubmissions.toLocaleString(), delta: 'From database', pos: true },
          { label: 'Resolved', value: stats.resolvedSubmissions.toLocaleString(), delta: `${stats.resolutionRate}% rate`, pos: true },
          { label: 'HEIs Engaged', value: stats.institutionsEngaged, delta: `${stats.districtsCovered} districts`, pos: false },
          { label: 'Industry Partners', value: stats.industryPartners, delta: `₹${stats.fundingCommittedCrore}Cr committed`, pos: true },
          { label: 'Active Projects', value: `${stats.projectsActive}`, delta: `${stats.projectsCompleted} completed`, pos: true },
          { label: 'ABC Credits Awarded', value: stats.creditsAwarded.toLocaleString(), delta: 'From milestones', pos: true },
          { label: 'Patents Filed', value: stats.patentsFiled, delta: 'From IP declarations', pos: false },
          { label: 'Community Deployments', value: stats.communityDeployments, delta: 'Completed projects', pos: true },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className={`stat-card-delta ${s.pos ? 'positive' : 'neutral'}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* ── DOMAIN + DISTRICT ── */}
      <div className={styles.twoCol}>
        {/* Domain Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className={styles.sectionTitle}>Submissions by Domain</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {stats.submissionsByDomain.map((d: any) => (
              <div key={d.domain}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <span className="text-xs font-medium">{d.domain}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--cf-800)' }}>{d.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill fill-dark" style={{ width: `${(d.count / maxDomain) * 100}%` }} />
                </div>
              </div>
            ))}
            {stats.submissionsByDomain.length === 0 && (
              <p className="text-sm text-tertiary">No submissions yet.</p>
            )}
          </div>
        </div>

        {/* District Top 5 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.sectionTitle}>Top Districts</h2>
            <Link href="/admin/heatmap" className="btn btn-ghost btn-sm">Full Map</Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {topDistricts.map((d: any, i: number) => (
              <div key={d.district} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ width: 20, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span className="text-sm font-medium">{d.district}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{d.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill fill-navy" style={{ width: `${(d.count / maxDist) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {topDistricts.length === 0 && (
              <p className="text-sm text-tertiary">No district data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── PROJECT LIFECYCLE OVERVIEW ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Project Lifecycle Overview</h2>
          <Link href="/university/projects" className="btn btn-ghost btn-sm">Manage</Link>
        </div>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Institution</th>
                  <th>Industry Partner</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Next Milestone</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => {
                  const done = p.milestones?.filter((m: any) => m.completed).length ?? 0
                  const total = p.milestones?.length ?? 0
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  const next = p.milestones?.find((m: any) => !m.completed)
                  return (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{p.title}</p>
                          <p className="text-xs text-tertiary">{p.id}</p>
                        </div>
                      </td>
                      <td className="text-sm">{p.institution_name}</td>
                      <td className="text-xs">{p.industry_partner_name ?? '—'}</td>
                      <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 100 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-bar-fill fill-dark" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{pct}%</span>
                        </div>
                      </td>
                      <td className="text-xs">
                        {next ? (
                          <div>
                            <p className="font-medium">{next.title}</p>
                            <p className="text-tertiary">Due {new Date(next.due_date).toLocaleDateString('en-IN')}</p>
                          </div>
                        ) : (
                          <span className="badge badge-resolved">All Done</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                      No projects created yet. Projects appear here after a university accepts a challenge.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
