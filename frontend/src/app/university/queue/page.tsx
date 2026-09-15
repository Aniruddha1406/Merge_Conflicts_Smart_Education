'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/Modal'
import { acceptChallenge, declineChallenge, createProject } from '@/app/actions/projects'
import { getAssignableChallenges } from '@/app/actions/challenges'
import styles from './page.module.css'

type SortKey = 'fitScore' | 'urgency'

interface QueueItem {
  id: string
  title: string
  description: string
  domain: string
  district: string
  village?: string | null
  urgency_score: number
  status: string
  fit_score?: number | null
  assigned_institution_name?: string | null
  ai_category?: string | null
  ai_subcategory?: string | null
  ai_technical_core?: string | null
  ai_academic_field?: string | null
  ai_triage?: string | null
}

export default function UniversityQueuePage() {
  const [challenges, setChallenges] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortKey>('fitScore')
  const [assignModal, setAssignModal] = useState<{ subId: string; subTitle: string; fitScore: number } | null>(null)
  const [mentor, setMentor] = useState('')
  const [targetDate, setTargetDate] = useState('2027-03-31')
  const [teamMembers, setTeamMembers] = useState([
    { name: '', role: 'Student Lead', department: '', creditHours: 60 },
  ])
  const [declined, setDeclined] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch challenges assigned to BIT Mesra (INST-001) or validated & unassigned
      const rows = await getAssignableChallenges('INST-001')
      setChallenges(rows as QueueItem[])
    } catch (e) {
      console.error('Failed to load queue from DB', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Filter out declined
  const queue = challenges.filter(c => !declined.has(c.id))

  const sorted = [...queue].sort((a, b) => {
    if (sort === 'fitScore') return (b.fit_score ?? 0) - (a.fit_score ?? 0)
    return (b.urgency_score ?? 0) - (a.urgency_score ?? 0)
  })

  function addTeamMember() {
    setTeamMembers(prev => [...prev, { name: '', role: 'Student', department: '', creditHours: 30 }])
  }

  function updateTeamMember(index: number, field: string, value: string | number) {
    setTeamMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function removeTeamMember(index: number) {
    setTeamMembers(prev => prev.filter((_, i) => i !== index))
  }

  async function handleConfirmAssign() {
    if (!assignModal || !mentor.trim()) return
    setIsSubmitting(true)

    try {
      // 1. Accept challenge
      await acceptChallenge(assignModal.subId)

      // 2. Create project with user-specified team and auto-generated milestones
      const validTeam = teamMembers.filter(m => m.name.trim())
      await createProject({
        challengeId: assignModal.subId,
        title: assignModal.subTitle,
        institutionId: 'INST-001',
        institutionName: 'BIT Mesra',
        targetDate: targetDate,
        team: [
          { name: mentor, role: 'Faculty Mentor', department: 'Lead PI', creditHours: 0 },
          ...validTeam,
        ],
        milestones: [
          { title: 'Phase 1: Ground Survey & Need Assessment', description: 'Conduct field survey, baseline sample collection, and stakeholder interviews', dueDate: getDateOffset(30), studentHours: 40, deliverables: ['Baseline Survey Report', 'GIS Site Map'] },
          { title: 'Phase 2: Prototyping & Lab Simulation', description: 'Fabricate initial prototype, perform lab validation tests', dueDate: getDateOffset(75), studentHours: 65, deliverables: ['Functional Prototype', 'Lab Performance Data'] },
          { title: 'Phase 3: Field Testing & Community Pilot', description: 'Deploy prototype on-site, measure efficacy, gather citizen feedback', dueDate: getDateOffset(120), studentHours: 50, deliverables: ['Field Trial Log', 'Citizen Feedback Sign-off'] },
          { title: 'Phase 4: Handover & Pilot Sign-off', description: 'Hand over solution to local authorities, publish technical report', dueDate: getDateOffset(150), studentHours: 30, deliverables: ['Official Handover Deed', 'NEP 2020 Credit Report'] },
        ]
      })

      setDeclined(prev => new Set(prev).add(assignModal.subId))
      setAssignModal(null)
      await loadData()
    } catch (e) {
      console.error('Failed to accept challenge:', e)
      alert('Failed to create project. See console for details.')
    }
    setIsSubmitting(false)
  }

  async function handleDecline(subId: string) {
    const reason = prompt('Reason for declining (optional):') || 'Capacity constraints'
    await declineChallenge(subId, reason)
    setDeclined(prev => new Set(prev).add(subId))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Challenge Queue</h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Loading assigned challenges from database...'
              : `${sorted.length} challenge(s) assigned or available. Data from database (live).`}
          </p>
          <p className="text-xs text-tertiary" style={{ marginTop: '0.25rem' }}>
            Routing scores computed by local weighted algorithm (50% disciplinary + 30% geographic + 20% bandwidth). Not ML-based.
          </p>
        </div>
        <div className={styles.sortRow}>
          <span className="text-sm text-secondary">Sort by:</span>
          <button className={`btn btn-sm ${sort === 'fitScore' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSort('fitScore')}>Fit Score</button>
          <button className={`btn btn-sm ${sort === 'urgency' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSort('urgency')}>Urgency</button>
        </div>
      </div>

      {sorted.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-mark">✓</div>
          <h5>No pending challenges in queue</h5>
          <p>All routed challenges have been accepted or declined.</p>
        </div>
      )}

      <div className={styles.queueList}>
        {sorted.map(c => (
          <div className="card" key={c.id}>
            <div className="card-header">
              <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                  <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>{c.id}</span>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="tag tag-accent">{c.domain}</span>
                    <span className="tag">{c.district}</span>
                    <span className="badge badge-verification">Urgency: {c.urgency_score}</span>
                    {c.ai_triage && (
                      <span className={`badge ${c.ai_triage === 'INNOVATION_CHALLENGE' ? 'badge-assigned' : 'badge-review'}`}>
                        {c.ai_triage === 'INNOVATION_CHALLENGE' ? 'R&D Challenge' : 'Administrative'}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.fitBlock}>
                  <span className="text-xs text-secondary">Fit Score</span>
                  <div className={styles.fitScore}>{c.fit_score ? `${Math.round(c.fit_score * 100)}%` : '—'}</div>
                  {c.fit_score && (
                    <div className="progress-bar">
                      <div className={`progress-bar-fill ${c.fit_score >= 0.85 ? 'fill-dark' : ''}`} style={{ width: `${c.fit_score * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body">
              <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-3)' }}>{c.description}</p>
              {c.ai_technical_core && (
                <div style={{ padding: 'var(--space-2)', background: 'var(--ai-50)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-3)' }}>
                  <span className="text-xs text-secondary">Technical Core:</span>
                  <p className="text-sm font-medium" style={{ fontStyle: 'italic', color: 'var(--cf-800)' }}>{c.ai_technical_core}</p>
                </div>
              )}
              {c.ai_academic_field && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <span className="text-xs text-secondary">Academic Field:</span>
                  <span className="tag tag-accent text-xs">{c.ai_academic_field}</span>
                </div>
              )}
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleDecline(c.id)}>Decline</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setAssignModal({ subId: c.id, subTitle: c.title, fitScore: c.fit_score ?? 0 })}
              >
                Accept & Form R&D Team
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Accept Challenge & Form R&D Team"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setAssignModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" disabled={isSubmitting || !mentor.trim()} onClick={handleConfirmAssign}>
              {isSubmitting ? 'Creating Project...' : 'Confirm & Create Project'}
            </button>
          </>
        }
      >
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-5)' }}>
          Accepting this challenge will create a real project in the database with milestones, team assignments, and ABC credit tracking.
        </p>
        <div className="form-group">
          <label className="form-label">Faculty Principal Investigator *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Prof. Anita Sharma (Dept. of Civil Engineering)"
            value={mentor}
            onChange={e => setMentor(e.target.value)}
          />
          <span className="form-hint">Type the faculty name and department</span>
        </div>
        <div className="form-group">
          <label className="form-label">Target Completion Date</label>
          <input type="date" className="form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Student R&D Team</label>
          {teamMembers.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
              <input
                className="form-input"
                placeholder="Student name"
                value={m.name}
                onChange={e => updateTeamMember(i, 'name', e.target.value)}
                style={{ flex: 2 }}
              />
              <select
                className="form-select"
                value={m.role}
                onChange={e => updateTeamMember(i, 'role', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="Student Lead">Student Lead</option>
                <option value="Student Researcher">Researcher</option>
                <option value="Student">Student</option>
              </select>
              <input
                className="form-input"
                placeholder="Dept"
                value={m.department}
                onChange={e => updateTeamMember(i, 'department', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                className="form-input"
                type="number"
                placeholder="Hours"
                value={m.creditHours}
                onChange={e => updateTeamMember(i, 'creditHours', Number(e.target.value))}
                style={{ width: '80px' }}
              />
              {teamMembers.length > 1 && (
                <button className="btn btn-ghost btn-sm" onClick={() => removeTeamMember(i)} style={{ color: '#EF4444', padding: '0.25rem' }}>✕</button>
              )}
            </div>
          ))}
          <button className="btn btn-outline btn-sm" onClick={addTeamMember}>+ Add Team Member</button>
        </div>
      </Modal>
    </div>
  )
}

function getDateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
