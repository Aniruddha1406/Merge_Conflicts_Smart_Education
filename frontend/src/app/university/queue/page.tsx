'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/Modal'
import { acceptChallenge, declineChallenge, createProject } from '@/app/actions/projects'
import { getAssignableChallenges } from '@/app/actions/challenges'
import { getPersonnel } from '@/app/actions/personnel'
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
  const [facultyList, setFacultyList] = useState<string[]>([])
  const [studentList, setStudentList] = useState<any[]>([])
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
      const [rows, personnel] = await Promise.all([
        getAssignableChallenges('INST-001'),
        getPersonnel()
      ])
      setChallenges(rows as QueueItem[])
      setFacultyList(personnel.faculty || [])
      setStudentList(personnel.students || [])
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
          { id: `M-1-${Date.now()}`, title: 'Phase 1: Ground Survey & Need Assessment', description: 'Conduct field survey, baseline sample collection, and stakeholder interviews', dueDate: getDateOffset(30), studentHours: 40, deliverables: ['Baseline Survey Report', 'GIS Site Map'] },
          { id: `M-2-${Date.now()}`, title: 'Phase 2: Tech Design & Architecture', description: 'Develop initial blueprints, software architecture, and system models', dueDate: getDateOffset(60), studentHours: 60, deliverables: ['Design Document', 'Mockups'] },
          { id: `M-3-${Date.now()}`, title: 'Phase 3: Prototype Development', description: 'Build minimum viable product (MVP) or physical prototype for testing', dueDate: getDateOffset(120), studentHours: 120, deliverables: ['Working Prototype', 'Source Code/Schematics'] },
          { id: `M-4-${Date.now()}`, title: 'Phase 4: Field Testing & Verification', description: 'Deploy prototype on-site, gather feedback, and verify resolution', dueDate: getDateOffset(150), studentHours: 80, deliverables: ['Test Results', 'Final Report'] },
        ],
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
          <select
            className="form-select"
            value={mentor}
            onChange={e => setMentor(e.target.value)}
          >
            <option value="">Select Faculty...</option>
            {facultyList.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <span className="form-hint">Select the registered faculty PI</span>
        </div>
        <div className="form-group">
          <label className="form-label">Target Completion Date</label>
          <input type="date" className="form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Student R&D Team</label>
          {teamMembers.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
              <select
                className="form-select"
                value={m.name}
                onChange={e => {
                  const studentName = e.target.value;
                  const student = studentList.find(s => s.name === studentName);
                  setTeamMembers(prev => prev.map((member, idx) => 
                    idx === i ? { ...member, name: studentName, department: student?.dept || member.department } : member
                  ));
                }}
                style={{ flex: 2 }}
              >
                <option value="">Select Student...</option>
                {studentList.map(s => <option key={s.name} value={s.name}>{s.name} ({s.degree})</option>)}
              </select>
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
                readOnly
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
