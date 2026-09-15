'use client'
import Link from 'next/link'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { INSTITUTIONS } from '@/lib/mockData'
import Modal from '@/components/Modal'
import { assignChallenge, validateChallenge, rejectChallenge, getRoutingRecommendations, getAllChallenges } from '@/app/actions/challenges'
import styles from './page.module.css'

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Validated': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
  'Rejected': 'badge-submitted',
}

const PAGE_SIZE = 10

// Adapter: convert DB row shape to component display shape
interface DisplaySubmission {
  id: string
  title: string
  description: string
  domain: string
  district: string
  block?: string | null
  village?: string | null
  submittedBy: string
  submittedAt: string
  status: string
  endorsements: number
  urgencyScore: number
  assignedInstitution?: string | null
  fitScore?: number | null
  aiCategory?: string | null
  aiSubcategory?: string | null
  aiPriority?: string | null
  aiTechnicalCore?: string | null
  aiAcademicField?: string | null
  aiTriage?: string | null
  aiConfidence?: number | null
  aiKeywords?: string | null
  reporterType?: string
}

function dbToDisplay(row: any): DisplaySubmission {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    domain: row.domain,
    district: row.district,
    block: row.block,
    village: row.village,
    submittedBy: row.submitted_by_name,
    submittedAt: row.submitted_at,
    status: row.status,
    endorsements: row.endorsements,
    urgencyScore: row.urgency_score,
    assignedInstitution: row.assigned_institution_name,
    fitScore: row.fit_score,
    aiCategory: row.ai_category,
    aiSubcategory: row.ai_subcategory,
    aiPriority: row.ai_priority,
    aiTechnicalCore: row.ai_technical_core,
    aiAcademicField: row.ai_academic_field,
    aiTriage: row.ai_triage,
    aiConfidence: row.ai_confidence,
    aiKeywords: row.ai_keywords,
    reporterType: row.reporter_type,
  }
}

export default function AllSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DisplaySubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDomain, setFilterDomain] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [selectedInst, setSelectedInst] = useState(INSTITUTIONS[0]?.shortName || '')
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [drawerSub, setDrawerSub] = useState<string | null>(null)

  // Fetch ALL challenges from the DB on mount and after mutations
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await getAllChallenges()
      setSubmissions(rows.map(dbToDisplay))
    } catch (e) {
      console.error('Failed to load submissions from DB', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Filtering
  const filtered = useMemo(() => {
    let list = submissions
    if (filterDomain) list = list.filter(s => s.domain === filterDomain)
    if (filterStatus) list = list.filter(s => s.status === filterStatus)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      )
    }
    return list
  }, [submissions, filterDomain, filterStatus, searchQuery])

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const drawerSubmission = submissions.find(s => s.id === drawerSub)

  // Domains for filter dropdown
  const domains = useMemo(() => [...new Set(submissions.map(s => s.domain))].sort(), [submissions])
  const statuses = useMemo(() => [...new Set(submissions.map(s => s.status))].sort(), [submissions])

  // Fetch routing recommendations when opening assign modal
  useEffect(() => {
    if (assignModal) {
      setLoadingRecs(true)
      getRoutingRecommendations(assignModal).then(recs => {
        setRecommendations(recs)
        setLoadingRecs(false)
        if (recs.length > 0) {
          setSelectedInst(recs[0].shortName || recs[0].institutionName)
        }
      }).catch(() => setLoadingRecs(false))
    }
  }, [assignModal])

  async function handleAssign() {
    if (!assignModal) return
    const instObj = INSTITUTIONS.find(i => i.shortName === selectedInst)
    const recObj = recommendations.find(r => r.shortName === selectedInst || r.institutionName === selectedInst)
    const fitScore = recObj ? recObj.fitScore / 100 : 0.85

    await assignChallenge(
      assignModal,
      instObj?.id || 'INST-001',
      selectedInst,
      fitScore,
      'G-001',
      'Dept. of Higher Education Admin'
    )
    setAssignModal(null)
    await loadData() // Refresh from DB
  }

  async function handleValidate(id: string) {
    await validateChallenge(id, 'G-001', 'Approved by State Portal Admin')
    setDrawerSub(null)
    await loadData() // Refresh from DB
  }

  async function handleReject(id: string) {
    const reason = prompt('Reason for rejecting this challenge submission:')
    if (!reason) return
    await rejectChallenge(id, reason)
    setDrawerSub(null)
    await loadData() // Refresh from DB
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>All Submissions & AI Routing</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading...' : `${submissions.length} total submissions from database (live)`}
          </p>
        </div>
      </div>

      {/* Filter Bar — reads from DB data, not mock */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          placeholder="Search by title, description, or ID..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
          style={{ maxWidth: '320px' }}
        />
        <select className="form-select" value={filterDomain} onChange={e => { setFilterDomain(e.target.value); setPage(1) }}
          style={{ maxWidth: '180px' }}
        >
          <option value="">All Domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="form-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-secondary" style={{ marginLeft: 'auto' }}>
          Showing {filtered.length} of {submissions.length}
        </span>
      </div>

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
                    <th>Triage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(s => (
                    <tr key={s.id}>
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
                      <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-submitted'}`}>{s.status}</span></td>
                      <td>
                        <span className="text-sm font-semibold" style={{ color: s.urgencyScore >= 85 ? 'var(--cf-800)' : 'var(--ai-700)' }}>
                          {s.urgencyScore}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${s.aiTriage === 'INNOVATION_CHALLENGE' ? 'badge-assigned' : 'badge-review'}`}>
                          {s.aiTriage === 'INNOVATION_CHALLENGE' ? 'R&D' : s.aiTriage === 'ADMINISTRATIVE_ISSUE' ? 'Admin' : '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          {!s.assignedInstitution && s.status !== 'Resolved' && s.status !== 'Rejected' && (
                            <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(s.id)}>Assign</button>
                          )}
                          {s.status === 'Submitted' && (
                            <button className="btn btn-ghost btn-sm" style={{ color: '#10B981' }} onClick={() => handleValidate(s.id)}>Validate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-tertiary)' }}>
                      {loading ? 'Loading submissions from database...' : 'No submissions match your filters.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPage(i + 1)}
                >{i + 1}</button>
              ))}
              {pages > 10 && <span className="text-xs text-secondary">... {pages} pages</span>}
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
                  ['Reporter Type', drawerSubmission.reporterType || 'citizen'],
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

              {/* AI Analysis Section */}
              {drawerSubmission.aiCategory && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--ai-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--ai-200)' }}>
                  <h4 className="text-xs text-secondary" style={{ marginBottom: 'var(--space-2)', letterSpacing: '0.05em' }}>
                    AI ANALYSIS (Local Rule-Based Classifier)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                    <div>
                      <span className="text-xs text-secondary">Category</span>
                      <p className="text-sm font-semibold">{drawerSubmission.aiCategory}</p>
                    </div>
                    <div>
                      <span className="text-xs text-secondary">Subcategory</span>
                      <p className="text-sm font-semibold">{drawerSubmission.aiSubcategory}</p>
                    </div>
                    <div>
                      <span className="text-xs text-secondary">Priority</span>
                      <p className="text-sm font-semibold">{drawerSubmission.aiPriority}</p>
                    </div>
                    <div>
                      <span className="text-xs text-secondary">Confidence</span>
                      <p className="text-sm font-semibold">{drawerSubmission.aiConfidence ? `${Math.round(drawerSubmission.aiConfidence * 100)}%` : '—'}</p>
                    </div>
                  </div>
                  {drawerSubmission.aiTechnicalCore && (
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <span className="text-xs text-secondary">Technical Core</span>
                      <p className="text-sm" style={{ fontStyle: 'italic' }}>{drawerSubmission.aiTechnicalCore}</p>
                    </div>
                  )}
                  {drawerSubmission.aiAcademicField && (
                    <div style={{ marginTop: 'var(--space-1)' }}>
                      <span className="text-xs text-secondary">Target Academic Field</span>
                      <p className="text-sm font-semibold">{drawerSubmission.aiAcademicField}</p>
                    </div>
                  )}
                  {drawerSubmission.aiKeywords && (
                    <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {drawerSubmission.aiKeywords.split(',').filter(Boolean).map((kw, i) => (
                        <span key={i} className="tag" style={{ fontSize: '0.7rem', background: '#F0EBE1' }}>#{kw.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
                {drawerSubmission.status === 'Validated' && (
                  <Link href="/admin/allocation" className="btn btn-primary btn-sm">
                    Allocate to Institution
                  </Link>
                )}
                {drawerSubmission.status === 'Submitted' && (
                  <button className="btn btn-outline btn-sm" style={{ borderColor: '#10B981', color: '#10B981' }} onClick={() => handleValidate(drawerSubmission.id)}>
                    Approve / Validate
                  </button>
                )}
                {drawerSubmission.status !== 'Resolved' && drawerSubmission.status !== 'Rejected' && (
                  <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }} onClick={() => handleReject(drawerSubmission.id)}>
                    Reject Submission
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal with AI Routing Engine Recommendations */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Smart Institution Routing & Assignment"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAssign}>Confirm Assignment</button>
          </>
        }
      >
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cf-800)', marginBottom: '0.5rem' }}>
            AI Recommended Higher Education Institutions
          </h4>
          <p className="text-xs text-secondary" style={{ marginBottom: '0.5rem' }}>
            Scores computed by local weighted algorithm (50% disciplinary fit + 30% geographic proximity + 20% bandwidth). Not ML-based.
          </p>
          {loadingRecs ? (
            <p className="text-xs text-secondary">Computing academic department fit & capacity...</p>
          ) : recommendations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {recommendations.map(rec => (
                <div
                  key={rec.institutionId}
                  onClick={() => setSelectedInst(rec.shortName || rec.institutionName)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: ((rec.shortName || rec.institutionName) === selectedInst)
                      ? '2px solid var(--cf-600, #4A3B32)' : '1px solid #E5E7EB',
                    background: ((rec.shortName || rec.institutionName) === selectedInst)
                      ? '#FBF9F5' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span className="text-sm font-semibold text-cf-800">{rec.shortName || rec.institutionName}</span>
                    <p className="text-xs text-secondary">{rec.matchBasis?.slice(0, 2).join(' • ')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-assigned" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(rec.fitScore * 100)}% Match</span>
                    <span className="text-xs text-secondary block">Specialization Fit</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary mb-2">No direct AI matches found. Select institution manually below.</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Selected Institution</label>
          <select className="form-select" value={selectedInst} onChange={e => setSelectedInst(e.target.value)}>
            {INSTITUTIONS.map(i => <option key={i.id} value={i.shortName}>{i.shortName} — {i.location}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  )
}
