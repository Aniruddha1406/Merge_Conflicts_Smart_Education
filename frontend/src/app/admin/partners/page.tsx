'use client'

import { useState, useEffect } from 'react'
import { INDUSTRY_PARTNERS, PROJECTS } from '@/lib/mockData'
import { useStore } from '@/lib/store'
import Modal from '@/components/Modal'
import styles from './page.module.css'

const STATUS_COLOR: Record<string, string> = {
  'Active': 'badge-inprogress',
  'Planning': 'badge-review',
  'Testing': 'badge-verification',
  'Completed': 'badge-resolved',
  'Stalled': 'badge-submitted',
}

export default function PartnersPage() {
  const { state } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [allProjects, setAllProjects] = useState(PROJECTS)

  // Load projects from localStorage so recently admitted ones show up
  useEffect(() => {
    const stored = localStorage.getItem('mock_projects')
    if (stored) {
      try { setAllProjects(JSON.parse(stored)) } catch {}
    }
    // Listen for storage changes from other tabs/portals
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mock_projects' && e.newValue) {
        try { setAllProjects(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Industry & CSR Partners</h1>
        <p className={styles.subtitle}>{INDUSTRY_PARTNERS.length} registered funding and co-development partners</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Sector</th>
                <th>CSR Focus Areas</th>
                <th>Total Committed</th>
                <th>Active Commitments</th>
                <th>Capabilities</th>
                <th>Projects</th>
              </tr>
            </thead>
            <tbody>
              {INDUSTRY_PARTNERS.map(p => {
                const partnerCommitments = state.commitments.filter(c => c.partnerId === p.id)
                const partnerProjects = allProjects.filter(proj => proj.industryPartner === p.name)
                return (
                  <tr key={p.id} style={{ cursor: partnerProjects.length > 0 ? 'pointer' : 'default' }} onClick={() => partnerProjects.length > 0 && setExpandedId(expandedId === p.id ? null : p.id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--ai-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--cf-800)', flexShrink: 0 }}>{p.name[0]}</div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{p.name}</p>
                          <p className="text-xs text-secondary">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="tag">{p.sector}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                        {p.csrFocusAreas.slice(0, 2).map(a => <span key={a} className="tag tag-accent text-xs">{a}</span>)}
                        {p.csrFocusAreas.length > 2 && <span className="tag text-xs">+{p.csrFocusAreas.length - 2}</span>}
                      </div>
                    </td>
                    <td className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>₹{p.totalFundingCrore}Cr</td>
                    <td className="text-sm">{p.activeCommitments}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                        {p.capabilities.slice(0, 2).map(c => <span key={c} className="tag text-xs">{c}</span>)}
                        {p.capabilities.length > 2 && <span className="tag text-xs">+{p.capabilities.length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-inprogress">{partnerProjects.length} project{partnerProjects.length !== 1 ? 's' : ''}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded project details modal */}
      <Modal
        open={!!expandedId}
        onClose={() => setExpandedId(null)}
        title={`Projects — ${INDUSTRY_PARTNERS.find(p => p.id === expandedId)?.name || ''}`}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {allProjects
            .filter(proj => proj.industryPartner === INDUSTRY_PARTNERS.find(p => p.id === expandedId)?.name)
            .map(proj => {
              const totalMs = proj.milestones.length
              const completedMs = proj.milestones.filter(m => m.completed).length
              const progressPct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0
              return (
                <div key={proj.id} style={{ padding: 'var(--space-5)', background: 'var(--warm-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)', marginBottom: '4px' }}>{proj.title}</p>
                      <p className="text-xs text-secondary">Institution: {proj.institution} · {proj.startDate} → {proj.targetDate}</p>
                    </div>
                    <span className={`badge ${STATUS_COLOR[proj.status] || 'badge-submitted'}`}>{proj.status}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-xs text-secondary">Milestone Progress</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--cf-800)' }}>{completedMs}/{totalMs} ({progressPct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill fill-navy" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {proj.milestones.map(ms => (
                      <div key={ms.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: ms.completed ? 'rgba(34,197,94,0.08)' : 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', background: ms.completed ? '#22c55e' : 'var(--warm-200)', color: ms.completed ? 'white' : 'var(--text-secondary)', flexShrink: 0 }}>
                          {ms.completed ? '✓' : '○'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p className="text-xs font-semibold" style={{ color: 'var(--cf-800)' }}>{ms.title}</p>
                          <p className="text-xs text-secondary">Due: {ms.dueDate}{ms.completedDate ? ` · Completed: ${ms.completedDate}` : ''}</p>
                        </div>
                        {ms.rubricScore && <span className="text-xs font-semibold" style={{ color: 'var(--ai-700)' }}>{ms.rubricScore}/100</span>}
                      </div>
                    ))}
                  </div>

                  {/* Team */}
                  <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {proj.team.map(t => (
                      <span key={t.id} className="tag text-xs">{t.name} ({t.role})</span>
                    ))}
                  </div>
                </div>
              )
            })}
          {allProjects.filter(proj => proj.industryPartner === INDUSTRY_PARTNERS.find(p => p.id === expandedId)?.name).length === 0 && (
            <p className="text-sm text-secondary">No projects linked to this partner yet.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
