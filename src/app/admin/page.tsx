'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/authContext'
import { useStore } from '@/lib/store'
import { DASHBOARD_STATS, OUTCOME_METRICS } from '@/lib/mockData'
import Link from 'next/link'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Planning': 'badge-submitted',
  'Active': 'badge-inprogress',
  'Testing': 'badge-assigned',
  'Completed': 'badge-resolved',
  'Stalled': 'badge-review',
}

const MAX_DOMAIN = DASHBOARD_STATS.submissionsByDomain[0].count
const MAX_TREND  = Math.max(...DASHBOARD_STATS.monthlyTrend.map(m => m.submissions))

export default function AdminDashboard() {
  const { user } = useAuth()
  const { state, mergeCluster, assign } = useStore()

  const pendingClusters = state.clusters.filter(c => !state.mergedClusterIds.includes(c.primaryId))

  const totalHours = useMemo(() =>
    state.projects.flatMap(p => p.milestones.filter(m => m.completed)).reduce((s, m) => s + m.studentHours, 0),
    [state.projects]
  )
  const totalCredits = Math.round(totalHours / 30)
  const activeProjects = state.projects.filter(p => p.status === 'Active').length
  const completedProjects = state.projects.filter(p => p.status === 'Completed').length

  const topDistricts = DASHBOARD_STATS.submissionsByDistrict.slice(0, 5)
  const maxDist = topDistricts[0].count

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.pageTitle}>Government Dashboard — SIH26043</h1>
          <p className={styles.pageSubtitle}>
            Statewide analytics, AI moderation queue, and project lifecycle overview for the Societal Innovation Collaboration Portal.
          </p>
        </div>
        <div className={styles.welcomeMeta}>
          <span className="badge badge-assigned">NEP 2020 Aligned</span>
          <span className="text-xs text-secondary">Live Data</span>
        </div>
      </div>

      {/* ── KPI STRIP ROW 1 ── */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Total Submissions', value: DASHBOARD_STATS.totalSubmissions.toLocaleString(), delta: '+12% MoM', pos: true },
          { label: 'Resolved', value: DASHBOARD_STATS.resolvedSubmissions.toLocaleString(), delta: `${DASHBOARD_STATS.resolutionRate}% rate`, pos: true },
          { label: 'HEIs Engaged', value: DASHBOARD_STATS.institutionsEngaged, delta: `${DASHBOARD_STATS.districtsCovered} districts`, pos: false },
          { label: 'Industry Partners', value: DASHBOARD_STATS.industryPartners, delta: `₹${DASHBOARD_STATS.fundingCommittedCrore}Cr committed`, pos: true },
          { label: 'Active Projects', value: activeProjects + completedProjects + '/' + DASHBOARD_STATS.projectsActive, delta: `${completedProjects} completed`, pos: true },
          { label: 'ABC Credits Awarded', value: (DASHBOARD_STATS.creditsAwarded + totalCredits).toLocaleString(), delta: `${totalHours}h logged`, pos: true },
          { label: 'Patents Filed', value: OUTCOME_METRICS.patentsFiled, delta: `${OUTCOME_METRICS.patentsPending} pending`, pos: false },
          { label: 'Startups Spawned', value: OUTCOME_METRICS.startupsSpawned, delta: `${OUTCOME_METRICS.statesReplicating} states replicating`, pos: true },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className={`stat-card-delta ${s.pos ? 'positive' : 'neutral'}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* ── OUTCOME ROW ── */}
      <div className={styles.outcomeRow}>
        {[
          { label: 'IPs Declared', value: OUTCOME_METRICS.ipsDeclared },
          { label: 'Research Papers', value: OUTCOME_METRICS.researchPapersPublished },
          { label: 'Community Deployments', value: OUTCOME_METRICS.communityDeployments },
          { label: 'Avg. Days to Assign', value: DASHBOARD_STATS.avgTimeToAssign },
          { label: 'CSR Funding Committed', value: `₹${OUTCOME_METRICS.csrFundingCrore}Cr` },
        ].map(o => (
          <div key={o.label} className={styles.outcomePill}>
            <span className={styles.outcomeVal}>{o.value}</span>
            <span className={styles.outcomeLbl}>{o.label}</span>
          </div>
        ))}
      </div>

      {/* ── TREND CHART + DOMAIN BARS ── */}
      <div className={styles.twoCol}>
        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <h2 className={styles.sectionTitle}>Monthly Submission Trend (12 Months)</h2>
          </div>
          <div className="card-body">
            <div className={styles.trendChart}>
              {DASHBOARD_STATS.monthlyTrend.map(m => (
                <div key={m.month} className={styles.trendCol}>
                  <div className={styles.trendBars}>
                    <div
                      className={styles.trendBarSubmit}
                      style={{ height: `${(m.submissions / MAX_TREND) * 100}%` }}
                      title={`${m.submissions} submitted`}
                    />
                    <div
                      className={styles.trendBarResolved}
                      style={{ height: `${(m.resolved / MAX_TREND) * 100}%` }}
                      title={`${m.resolved} resolved`}
                    />
                  </div>
                  <span className={styles.trendLabel}>{m.month}</span>
                </div>
              ))}
            </div>
            <div className={styles.trendLegend}>
              <span className={styles.legendDot} style={{ background: 'var(--ai-400)' }} />
              <span className="text-xs text-secondary">Submitted</span>
              <span className={styles.legendDot} style={{ background: 'var(--cf-800)', marginLeft: 'var(--space-4)' }} />
              <span className="text-xs text-secondary">Resolved</span>
            </div>
          </div>
        </div>

        {/* Domain Breakdown + District Top 5 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <div className="card-header">
              <h2 className={styles.sectionTitle}>Submissions by Domain</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {DASHBOARD_STATS.submissionsByDomain.map(d => (
                <div key={d.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span className="text-xs font-medium">{d.domain}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--cf-800)' }}>{d.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill fill-dark" style={{ width: `${(d.count / MAX_DOMAIN) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.sectionTitle}>Top Districts</h2>
              <Link href="/admin/heatmap" className="btn btn-ghost btn-sm">Full Map</Link>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {topDistricts.map((d, i) => (
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
            </div>
          </div>
        </div>
      </div>

      {/* ── AI DEDUP QUEUE ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>AI Deduplication Queue</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="badge badge-verification">{pendingClusters.length} pending</span>
            <Link href="/admin/review" className="btn btn-ghost btn-sm">View All</Link>
          </div>
        </div>
        <p className={styles.sectionHint}>The NLP engine has grouped semantically similar submissions. Merge duplicates to boost urgency and prevent redundant routing.</p>
        {pendingClusters.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--ai-700)' }}>All clusters resolved. Queue is clear.</p>
          </div>
        ) : (
          <div className={styles.clusterGrid}>
            {pendingClusters.slice(0, 2).map(cluster => {
              const primary = state.submissions.find(s => s.id === cluster.primaryId)
              return (
                <div className="card" key={cluster.primaryId}>
                  <div className="card-header" style={{ background: 'var(--warm-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                      <div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-wider)' }}>PRIMARY: {cluster.primaryId}</span>
                        <h3 className={styles.clusterTitle}>{primary?.title ?? cluster.primaryId}</h3>
                      </div>
                      <span className="tag">{cluster.district}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <span className="text-xs text-secondary">Agg. Endorsements</span>
                        <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--cf-800)' }}>{cluster.mergedEndorsements}</div>
                      </div>
                      <div>
                        <span className="text-xs text-secondary">Computed Urgency</span>
                        <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ai-700)' }}>{cluster.mergedUrgency}/100</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {cluster.similarityScores.map(sim => (
                        <div key={sim.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--warm-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--cf-800)', minWidth: 32 }}>{Math.round(sim.score * 100)}%</span>
                          <span className="text-xs">{sim.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm">Keep Separate</button>
                    <button className="btn btn-primary btn-sm" onClick={() => mergeCluster(cluster.primaryId)}>
                      Merge & Boost Urgency
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
                {state.projects.map(p => {
                  const done = p.milestones.filter(m => m.completed).length
                  const total = p.milestones.length
                  const pct = Math.round((done / total) * 100)
                  const next = p.milestones.find(m => !m.completed)
                  return (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{p.title}</p>
                          <p className="text-xs text-tertiary">{p.id} — {p.submissionId}</p>
                        </div>
                      </td>
                      <td className="text-sm">{p.institution}</td>
                      <td className="text-xs">{p.industryPartner ?? '—'}</td>
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
                            <p className="text-tertiary">Due {new Date(next.dueDate).toLocaleDateString('en-IN')}</p>
                          </div>
                        ) : (
                          <span className="badge badge-resolved">All Done</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
