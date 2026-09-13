'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { INSTITUTIONS } from '@/lib/mockData'
import FilterBar, { DEFAULT_FILTERS, applyFilters } from '@/components/FilterBar'
import Modal from '@/components/Modal'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

const PAGE_SIZE = 5

export default function AllSubmissionsPage() {
  const { state, assign, setStatus } = useStore()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [selectedInst, setSelectedInst] = useState(INSTITUTIONS[0].shortName)
  const [drawerSub, setDrawerSub] = useState<string | null>(null)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => applyFilters(state.submissions, filters), [state.submissions, filters])
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const drawerSubmission = state.submissions.find(s => s.id === drawerSub)

  function handleAssign() {
    if (!assignModal) return
    const inst = INSTITUTIONS.find(i => i.shortName === selectedInst)
    assign(assignModal, selectedInst, inst ? 0.85 : 0.7)
    setAssignModal(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>All Submissions</h1>
          <p className={styles.subtitle}>{state.submissions.length} total submissions across Jharkhand</p>
        </div>
      </div>

      <FilterBar filters={filters} onChange={f => { setFilters(f); setPage(1) }} />

      <div className={styles.layout}>
        <div>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Domain</th>
                    <th>District</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Endorsements</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(s => (
                    <tr key={s.id} style={flagged.has(s.id) ? { background: 'var(--cf-50)' } : undefined}>
                      <td className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.id}</td>
                      <td
                        style={{ fontWeight: 500, color: 'var(--cf-800)', cursor: 'pointer', maxWidth: '220px' }}
                        className="text-sm"
                        onClick={() => setDrawerSub(s.id)}
                      >
                        {s.title}
                      </td>
                      <td><span className="tag tag-accent text-xs">{s.domain}</span></td>
                      <td className="text-sm">{s.district}</td>
                      <td><span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span></td>
                      <td>
                        <span className="text-sm font-semibold" style={{ color: s.urgencyScore >= 85 ? 'var(--cf-800)' : 'var(--ai-700)' }}>
                          {s.urgencyScore}
                        </span>
                      </td>
                      <td className="text-sm">{s.endorsements}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          {!s.assignedInstitution && s.status !== 'Resolved' && (
                            <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(s.id)}>Assign</button>
                          )}
                          <button
                            className={`btn btn-sm ${flagged.has(s.id) ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFlagged(f => { const n = new Set(f); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })}
                          >
                            {flagged.has(s.id) ? 'Flagged' : 'Flag'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)' }}>No submissions match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>

        {/* Detail drawer */}
        {drawerSubmission && (
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{drawerSubmission.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDrawerSub(null)}>Close</button>
            </div>
            <div className={styles.drawerBody}>
              <p className="text-sm">{drawerSubmission.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                {[
                  ['Domain', drawerSubmission.domain],
                  ['District', `${drawerSubmission.district}${drawerSubmission.village ? ', ' + drawerSubmission.village : ''}`],
                  ['Submitted By', drawerSubmission.submittedBy],
                  ['Date', new Date(drawerSubmission.submittedAt).toLocaleString('en-IN')],
                  ['Urgency Score', String(drawerSubmission.urgencyScore)],
                  ['Endorsements', String(drawerSubmission.endorsements)],
                  ...(drawerSubmission.assignedInstitution ? [['Assigned To', `${drawerSubmission.assignedInstitution} (${Math.round((drawerSubmission.fitScore ?? 0) * 100)}% fit)`]] : []),
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-xs text-secondary">{k}</span>
                    <p className="text-sm font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
                {!drawerSubmission.assignedInstitution && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setAssignModal(drawerSubmission.id); setDrawerSub(null) }}>
                    Assign to Institution
                  </button>
                )}
                {drawerSubmission.status !== 'Resolved' && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setStatus(drawerSubmission.id, 'Under Review'); setDrawerSub(null) }}>
                    Mark Under Review
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign to Institution"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAssign}>Confirm Assignment</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Select Institution</label>
          <select className="form-select" value={selectedInst} onChange={e => setSelectedInst(e.target.value)}>
            {INSTITUTIONS.map(i => <option key={i.id} value={i.shortName}>{i.shortName} — {i.location}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Override Fit Score (optional)</label>
          <input type="number" className="form-input" defaultValue={85} min={0} max={100} />
          <span className="form-hint">AI-computed score will be used if left unchanged.</span>
        </div>
      </Modal>
    </div>
  )
}
