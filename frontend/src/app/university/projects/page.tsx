'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getAllProjects } from '@/app/actions/projects'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Planning': 'badge-submitted',
  'Active': 'badge-inprogress',
  'Testing': 'badge-assigned',
  'Completed': 'badge-resolved',
  'Stalled': 'badge-review',
}

interface DisplayProject {
  id: string
  title: string
  institution_name: string
  industry_partner_name?: string | null
  status: string
  start_date: string
  target_date: string
  milestones: { id: string; title: string; completed: number; due_date: string }[]
  team: { name: string; role: string }[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<DisplayProject[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await getAllProjects()
      setProjects(rows as any[])
    } catch (e) {
      console.error('Failed to load projects from DB', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Active Projects</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading projects from database...' : `${projects.length} project(s) from database.`}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {projects.map(p => {
          const totalMilestones = p.milestones.length
          const completed = p.milestones.filter(m => m.completed).length
          const pct = totalMilestones > 0 ? Math.round((completed / totalMilestones) * 100) : 0
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
                    <p className="text-sm font-semibold">{p.institution_name}</p>
                  </div>
                  {p.industry_partner_name && (
                    <div>
                      <span className="text-xs text-secondary">Industry Partner</span>
                      <p className="text-sm font-semibold">{p.industry_partner_name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-secondary">Target Date</span>
                    <p className="text-sm font-semibold">{new Date(p.target_date).toLocaleDateString('en-IN')}</p>
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
                    <p className="text-xs text-tertiary">Due: {new Date(next.due_date).toLocaleDateString('en-IN')}</p>
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
        {!loading && projects.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-mark">0</div>
                <h5>No projects yet</h5>
                <p className="text-sm text-secondary">Accept a challenge from the queue to create your first project.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
