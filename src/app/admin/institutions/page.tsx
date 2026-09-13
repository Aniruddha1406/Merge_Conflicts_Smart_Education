'use client'

import { useState } from 'react'
import { INSTITUTIONS } from '@/lib/mockData'
import { useStore } from '@/lib/store'
import Modal from '@/components/Modal'
import styles from './page.module.css'

export default function InstitutionsPage() {
  const { state } = useStore()
  const [matchId, setMatchId] = useState<string | null>(null)
  const matchInst = INSTITUTIONS.find(i => i.id === matchId)
  const matchedChallenges = matchId
    ? state.submissions.filter(s => s.assignedInstitution === matchInst?.shortName)
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
              {INSTITUTIONS.map(inst => (
                <tr key={inst.id}>
                  <td>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{inst.shortName}</p>
                      <p className="text-xs text-secondary">{inst.name}</p>
                    </div>
                  </td>
                  <td><span className="tag">{inst.type}</span></td>
                  <td className="text-sm">{inst.location}</td>
                  <td className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{inst.activeProjects}</td>
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
                      Match Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!matchId}
        onClose={() => setMatchId(null)}
        title={`Match Report — ${matchInst?.shortName}`}
        size="lg"
      >
        {matchedChallenges.length === 0 ? (
          <p className="text-sm text-secondary">No challenges have been routed to this institution yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {matchedChallenges.map(s => (
              <div key={s.id} style={{ padding: 'var(--space-4)', background: 'var(--warm-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{s.title}</p>
                  <span className="text-sm font-bold" style={{ color: 'var(--ai-700)' }}>{Math.round((s.fitScore ?? 0) * 100)}% fit</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span className="tag tag-accent">{s.domain}</span>
                  <span className="tag">{s.district}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
