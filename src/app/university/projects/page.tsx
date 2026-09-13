'use client'

import { useStore } from '@/lib/store'
import Link from 'next/link'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Planning': 'badge-submitted',
  'Active': 'badge-inprogress',
  'Testing': 'badge-assigned',
  'Completed': 'badge-resolved',
  'Stalled': 'badge-review',
}

export default function ProjectsPage() {
  const { state } = useStore()
  const projects = state.projects

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Active Projects</h1>
          <p className={styles.subtitle}>All ongoing research and innovation projects assigned to your institution.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {projects.map(p => {
          const totalMilestones = p.milestones.length
          const completed = p.milestones.filter(m => m.completed).length
          const pct = Math.round((completed / totalMilestones) * 100)
          const next = p.milestones.find(m => !m.completed)

          return (
            <div className="card" key={p.id}>
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div>
                    <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>{p.id}</span>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                  </div>
                  <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                  <div>
                    <span className="text-xs text-secondary">Institution</span>
                    <p className="text-sm font-semibold">{p.institution}</p>
                  </div>
                  {p.industryPartner && (
                    <div>
                      <span className="text-xs text-secondary">Industry Partner</span>
                      <p className="text-sm font-semibold">{p.industryPartner}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-secondary">Target Date</span>
                    <p className="text-sm font-semibold">{new Date(p.targetDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span className="text-xs text-secondary">Progress — {completed}/{totalMilestones} milestones</span>
                    <span className="text-xs font-semibold">{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill fill-dark" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {next && (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--ai-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--ai-200)' }}>
                    <span className="text-xs text-secondary">Next milestone</span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{next.title}</p>
                    <p className="text-xs text-tertiary">Due: {new Date(next.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <Link href={`/university/projects/${p.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Open Project Workspace
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
