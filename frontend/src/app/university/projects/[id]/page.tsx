'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { useState } from 'react'
import Modal from '@/components/Modal'
import styles from './page.module.css'

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { state, completeMilestone, addMilestone } = useStore()

  const project = state.projects.find(p => p.id === id)
  const [rubricInputs, setRubricInputs] = useState<Record<string, number>>({})
  const [confirmMilestone, setConfirmMilestone] = useState<string | null>(null)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyDone, setVerifyDone] = useState(false)
  
  // New Milestone Form State
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false)
  const [newM, setNewM] = useState({ title: '', desc: '', due: '', hours: 40, deliverables: '' })

  if (!project) return (
    <div className="empty-state" style={{ padding: 'var(--space-20)' }}>
      <div className="empty-state-mark">?</div>
      <h5>Project not found</h5>
      <Link href="/university/projects" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-4)' }}>Back to Projects</Link>
    </div>
  )

  const totalHours = project.milestones.reduce((sum, m) => sum + m.studentHours, 0)
  const completedMilestones = project.milestones.filter(m => m.completed).length
  const pct = Math.round((completedMilestones / project.milestones.length) * 100)
  const estimatedCredits = Math.round(totalHours / 30)

  function handleCompleteMilestone() {
    if (confirmMilestone) {
      completeMilestone(project!.id, confirmMilestone, rubricInputs[confirmMilestone] ?? 80)
      setConfirmMilestone(null)
    }
  }

  function handleAddMilestone() {
    if (!newM.title) return
    const ms = {
      id: `M-${Date.now()}`,
      title: newM.title,
      description: newM.desc,
      dueDate: newM.due || new Date().toISOString(),
      studentHours: newM.hours,
      deliverables: newM.deliverables.split(',').map(s => s.trim()).filter(Boolean),
      completed: false,
    }
    addMilestone(project!.id, ms)
    setAddMilestoneOpen(false)
    setNewM({ title: '', desc: '', due: '', hours: 40, deliverables: '' })
  }

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Link href="/university/projects" className="btn btn-ghost btn-sm">← Projects</Link>
        <span className="badge badge-inprogress">{project.status}</span>
      </div>

      <div className={styles.titleRow}>
        <div>
          <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>{project.id}</span>
          <h1 className={styles.title}>{project.title}</h1>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span className="text-sm text-secondary">Institution: <strong>{project.institution}</strong></span>
            {project.industryPartner && <span className="text-sm text-secondary">Partner: <strong>{project.industryPartner}</strong></span>}
            <span className="text-sm text-secondary">Target: <strong>{new Date(project.targetDate).toLocaleDateString('en-IN')}</strong></span>
          </div>
        </div>
        <div className={styles.creditBox}>
          <span className="text-xs text-secondary">Total Student Hours</span>
          <div className="text-3xl font-bold" style={{ color: 'var(--cf-800)', fontFamily: 'var(--font-display)' }}>{totalHours}</div>
          <span className="text-xs text-secondary">≈ {estimatedCredits} ABC Credits</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className={styles.progressCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <span className="text-sm font-semibold">Overall Project Progress</span>
          <span className="text-sm font-semibold">{pct}% — {completedMilestones}/{project.milestones.length} milestones</span>
        </div>
        <div className="progress-bar" style={{ height: '12px' }}>
          <div className="progress-bar-fill fill-dark" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.layout}>
        {/* Milestones */}
        <div className={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.sectionTitle}>Milestone Timeline</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setAddMilestoneOpen(true)}>+ Add Milestone</button>
          </div>
          <div className={styles.milestones}>
            {project.milestones.map((m, i) => (
              <div key={m.id} className={`${styles.milestone} ${m.completed ? styles.done : ''}`}>
                <div className={styles.mNum}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.mContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className={styles.mTitle}>{m.title}</h3>
                    {m.completed
                      ? <span className="badge badge-resolved">Completed</span>
                      : <span className="badge badge-review">Pending</span>
                    }
                  </div>
                  <p className="text-sm text-secondary">{m.description}</p>

                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                    <span className="text-xs text-secondary">Due: {new Date(m.dueDate).toLocaleDateString('en-IN')}</span>
                    {m.completed && <span className="text-xs text-secondary">Completed: {m.completedDate}</span>}
                    {m.completed && m.rubricScore && <span className="text-xs font-semibold" style={{ color: 'var(--ai-700)' }}>Rubric: {m.rubricScore}/100</span>}
                    {m.completed && <span className="text-xs text-secondary">Hours Logged: {m.studentHours}h</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                    {m.deliverables.map(d => <span key={d} className="tag">{d}</span>)}
                  </div>

                  {!m.completed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <label className="text-xs font-medium">Rubric Score:</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="form-input"
                          style={{ width: '70px', padding: 'var(--space-2) var(--space-3)' }}
                          value={rubricInputs[m.id] ?? ''}
                          onChange={e => setRubricInputs(r => ({ ...r, [m.id]: Number(e.target.value) }))}
                          placeholder="0–100"
                        />
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setConfirmMilestone(m.id)}
                        disabled={!rubricInputs[m.id]}
                      >
                        Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Roster */}
        <div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Team Roster</h2>
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.team.map(m => (
                      <tr key={m.id}>
                        <td className="font-medium" style={{ color: 'var(--cf-800)' }}>{m.name}</td>
                        <td><span className="tag">{m.role}</span></td>
                        <td>{m.department}</td>
                        <td>{m.creditHours ? `${m.creditHours} cr` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Verification */}
          {project.milestones.some(m => m.title.includes('Verification')) && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>On-Ground Verification</h2>
              <div className="card card-accent">
                <div className="card-body">
                  {verifyDone ? (
                    <p className="text-sm font-semibold" style={{ color: 'var(--ai-700)' }}>Verification evidence submitted. Awaiting reporter confirmation.</p>
                  ) : (
                    <>
                      <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                        The final milestone requires the original reporter to submit a geo-tagged photo confirming the fix. You can also upload field evidence from your team here.
                      </p>
                      <button className="btn btn-primary btn-sm" onClick={() => setVerifyOpen(true)}>Upload Field Evidence</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestone confirm modal */}
      <Modal
        open={!!confirmMilestone}
        onClose={() => setConfirmMilestone(null)}
        title="Confirm Milestone Completion"
        size="sm"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setConfirmMilestone(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleCompleteMilestone}>Confirm</button>
          </>
        }
      >
        <p className="text-sm text-secondary">This will log the rubric score, mark the milestone as complete, and update the ABC credit count. This action cannot be undone.</p>
      </Modal>

      {/* Verify modal */}
      <Modal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title="Upload Field Evidence"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setVerifyOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setVerifyOpen(false); setVerifyDone(true) }}>Submit Evidence</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Field Photos</label>
          <input type="file" className="form-input" multiple accept="image/*" />
        </div>
        <div className="form-group">
          <label className="form-label">GPS Coordinates (auto)</label>
          <input type="text" className="form-input" defaultValue="Lat: 23.8, Lng: 84.07" readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" placeholder="Describe the on-ground situation..." />
        </div>
      </Modal>

      {/* Add Milestone modal */}
      <Modal
        open={addMilestoneOpen}
        onClose={() => setAddMilestoneOpen(false)}
        title="Add Project Milestone"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setAddMilestoneOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAddMilestone} disabled={!newM.title}>Add Milestone</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Title</label>
          <input type="text" className="form-input" value={newM.title} onChange={e => setNewM({...newM, title: e.target.value})} placeholder="e.g. Prototype Fabrication" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={newM.desc} onChange={e => setNewM({...newM, desc: e.target.value})} placeholder="What will be done in this phase?" />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={newM.due} onChange={e => setNewM({...newM, due: e.target.value})} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Est. Student Hours</label>
            <input type="number" className="form-input" value={newM.hours} onChange={e => setNewM({...newM, hours: Number(e.target.value)})} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Deliverables (comma separated)</label>
          <input type="text" className="form-input" value={newM.deliverables} onChange={e => setNewM({...newM, deliverables: e.target.value})} placeholder="e.g. CAD Design, Report" />
        </div>
      </Modal>
    </div>
  )
}
