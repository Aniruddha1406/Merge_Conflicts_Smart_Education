'use client'

import { useStore } from '@/lib/store'
import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import styles from './page.module.css'

export default function CodevelopmentPage() {
  const { state } = useStore()
  const partner = INDUSTRY_PARTNERS[0]
  const myCommitments = state.commitments.filter(c => c.partnerId === partner.id && c.type === 'Co-Development')
  const projects = state.projects.filter(p => p.industryPartner === partner.name)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Co-Development Workspace</h1>
      <p className={styles.subtitle}>Active joint research and prototype development projects with HEI partners.</p>

      {projects.length === 0 && myCommitments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-mark">0</div>
          <h5>No active co-development projects</h5>
          <p>Commit to a challenge as Co-Development to start a joint project.</p>
        </div>
      ) : (
        <div className={styles.projectList}>
          {projects.map(p => {
            const completedMs = p.milestones.filter(m => m.completed).length
            const totalMs = p.milestones.length
            const pct = Math.round((completedMs / totalMs) * 100)
            const next = p.milestones.find(m => !m.completed)

            return (
              <div className="card" key={p.id}>
                <div className="card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="text-xs text-tertiary">{p.id}</span>
                      <h2 className={styles.projectTitle}>{p.title}</h2>
                      <p className="text-sm text-secondary mt-1">With {p.institution}</p>
                    </div>
                    <span className="badge badge-inprogress">{p.status}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                    <div>
                      <span className="text-xs text-secondary">Milestones</span>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--cf-800)' }}>{completedMs}/{totalMs}</p>
                    </div>
                    <div>
                      <span className="text-xs text-secondary">Target Date</span>
                      <p className="text-sm font-semibold">{new Date(p.targetDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    {next && (
                      <div>
                        <span className="text-xs text-secondary">Next Milestone</span>
                        <p className="text-sm font-semibold">{next.title}</p>
                        <p className="text-xs text-tertiary">Due {new Date(next.dueDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span className="text-xs text-secondary">Overall Progress</span>
                      <span className="text-xs font-semibold">{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '10px' }}>
                      <div className="progress-bar-fill fill-dark" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className={styles.ipSection}>
                      <span className="text-xs text-secondary">IP / Patent Status</span>
                      <span className="badge badge-submitted">Not Filed</span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <button className="btn btn-outline btn-sm">Declare IP</button>
                      <button className="btn btn-primary btn-sm">Prototype Hand-off</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
