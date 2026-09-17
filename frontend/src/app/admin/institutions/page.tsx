'use client'

import { useState, useEffect } from 'react'
import { INSTITUTIONS, PROJECTS } from '@/lib/mockData'
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

export default function InstitutionsPage() {
  const { state } = useStore()
  const [matchId, setMatchId] = useState<string | null>(null)
  const matchInst = INSTITUTIONS.find(i => i.id === matchId)
  const [allProjects, setAllProjects] = useState(PROJECTS)

  // Load projects from localStorage so recently admitted ones show up
  useEffect(() => {
    const stored = localStorage.getItem('mock_projects')
    if (stored) {
      try { setAllProjects(JSON.parse(stored)) } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mock_projects' && e.newValue) {
        try { setAllProjects(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Challenges assigned to this institution
  const matchedChallenges = matchId
    ? state.submissions.filter(s => s.assignedInstitution === matchInst?.shortName || s.assignedInstitution === matchInst?.name)
    : []

  // Projects belonging to this institution
  const matchedProjects = matchId
    ? allProjects.filter(p => p.institution === matchInst?.shortName || p.institution === matchInst?.name)
    : []

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Institution Management</h1>
        <p className={styles.subtitle}>{INSTITUTIONS.length} registered Higher Education Institutions</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Institution</th>
                <th>Type</th>
                <th>Location</th>
                <th>Active Projects</th>
                <th>Incubation</th>
                <th>Expertise</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {INSTITUTIONS.map(inst => {
                const instProjects = allProjects.filter(p => p.institution === inst.shortName || p.institution === inst.name)
                return (
                  <tr key={inst.id}>
                    <td>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{inst.shortName}</p>
                        <p className="text-xs text-secondary">{inst.name}</p>
                      </div>
                    </td>
                    <td><span className="tag">{inst.type}</span></td>
                    <td className="text-sm">{inst.location}</td>
                    <td>
                      <span className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{instProjects.length}</span>
                    </td>
                    <td>
                      <span className={`badge ${inst.incubationCenter ? 'badge-resolved' : 'badge-submitted'}`}>
                        {inst.incubationCenter ? 'Active' : 'None'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                        {inst.expertiseTags.slice(0, 2).map(t => <span key={t} className="tag text-xs">{t}</span>)}
                        {inst.expertiseTags.length > 2 && <span className="tag text-xs">+{inst.expertiseTags.length - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setMatchId(inst.id)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!matchId}
        onClose={() => setMatchId(null)}
        title={`${matchInst?.shortName} — Challenges & Projects`}
        size="lg"
      >
        {/* Assigned Challenges */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cf-800)', marginBottom: 'var(--space-3)' }}>
          Assigned Challenges ({matchedChallenges.length})
        </h3>
        {matchedChallenges.length === 0 ? (
          <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-5)' }}>No challenges have been routed to this institution yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {matchedChallenges.map(s => (
              <div key={s.id} style={{ padding: 'var(--space-3)', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{s.title}</p>
                  <span className="text-sm font-bold" style={{ color: 'var(--ai-700)' }}>{Math.round((s.fitScore ?? 0) * 100)}% fit</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span className="tag tag-accent">{s.domain}</span>
                  <span className="tag">{s.district}</span>
                  <span className="tag">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects with Progress */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--cf-800)', marginBottom: 'var(--space-3)' }}>
          Projects ({matchedProjects.length})
        </h3>
        {matchedProjects.length === 0 ? (
          <p className="text-sm text-secondary">No active projects at this institution.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {matchedProjects.map(proj => {
              const totalMs = proj.milestones.length
              const completedMs = proj.milestones.filter(m => m.completed).length
              const progressPct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0
              return (
                <div key={proj.id} style={{ padding: 'var(--space-5)', background: 'var(--warm-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)', marginBottom: '4px' }}>{proj.title}</p>
                      <p className="text-xs text-secondary">Partner: {proj.industryPartner || 'None'} · {proj.startDate} → {proj.targetDate}</p>
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
          </div>
        )}
      </Modal>
    </div>
  )
}
