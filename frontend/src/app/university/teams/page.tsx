'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllProjects } from '@/app/actions/projects'
import { getPersonnel, addFaculty, addStudent } from '@/app/actions/personnel'
import Modal from '@/components/Modal'
import styles from './page.module.css'

export default function TeamsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [facultyList, setFacultyList] = useState<string[]>([])
  const [studentList, setStudentList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [facultyModalOpen, setFacultyModalOpen] = useState(false)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [newFacultyName, setNewFacultyName] = useState('')
  const [newStudent, setNewStudent] = useState({ name: '', degree: '', dept: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projRows, personnel] = await Promise.all([
        getAllProjects(),
        getPersonnel()
      ])
      setProjects(projRows)
      setFacultyList(personnel.faculty || [])
      setStudentList(personnel.students || [])
    } catch (e) {
      console.error('Failed to load data from DB', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleAddFaculty() {
    if (!newFacultyName.trim()) return
    setIsSubmitting(true)
    await addFaculty(newFacultyName.trim())
    setNewFacultyName('')
    setFacultyModalOpen(false)
    await loadData()
    setIsSubmitting(false)
  }

  async function handleAddStudent() {
    if (!newStudent.name.trim() || !newStudent.degree.trim() || !newStudent.dept.trim()) return
    setIsSubmitting(true)
    await addStudent({
      name: newStudent.name.trim(),
      degree: newStudent.degree.trim(),
      dept: newStudent.dept.trim()
    })
    setNewStudent({ name: '', degree: '', dept: '' })
    setStudentModalOpen(false)
    await loadData()
    setIsSubmitting(false)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Team Formation</h1>
      <p className={styles.subtitle}>
        {loading ? 'Loading team compositions...' : 'Current team compositions across all active projects. Faculty mentors and student members are shown with their department and credit allocation.'}
      </p>

      <div className={styles.layout}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Project Teams</h2>
          {projects.map(p => (
            <div className="card" key={p.id} style={{ marginBottom: 'var(--space-4)' }}>
              <div className="card-header">
                <span className="text-xs text-tertiary">{p.id}</span>
                <h3 className={styles.projectTitle}>{p.title}</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Credits Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.team.map((m: any) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 500, color: 'var(--cf-800)' }}>{m.name}</td>
                        <td><span className="tag">{m.role}</span></td>
                        <td>{m.department}</td>
                        <td>{m.creditHours ? `${m.creditHours} cr` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Available Faculty</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setFacultyModalOpen(true)}>+ Add Faculty</button>
          </div>
          <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {facultyList.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ai-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--cf-800)' }}>{f[0]}</div>
                    <span className="text-sm font-medium">{f}</span>
                  </div>
                  <span className="tag">Faculty</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Available Students</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setStudentModalOpen(true)}>+ Add Student</button>
          </div>
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {studentList.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--warm-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--cf-800)' }}>{s.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-secondary">{s.degree} — {s.dept}</p>
                    </div>
                  </div>
                  <span className="tag">{s.degree.includes('M.Tech') || s.degree.includes('PhD') || s.degree.includes('MD') ? 'Postgrad' : s.degree.includes('B.Tech') ? 'Undergrad' : 'Intern'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={facultyModalOpen}
        onClose={() => setFacultyModalOpen(false)}
        title="Register New Faculty"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setFacultyModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" disabled={isSubmitting || !newFacultyName.trim()} onClick={handleAddFaculty}>
              {isSubmitting ? 'Saving...' : 'Register'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" placeholder="e.g. Dr. A.K. Sharma" value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Register New Student"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setStudentModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" disabled={isSubmitting || !newStudent.name.trim() || !newStudent.degree.trim() || !newStudent.dept.trim()} onClick={handleAddStudent}>
              {isSubmitting ? 'Saving...' : 'Register'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" placeholder="e.g. Rahul Singh" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Degree/Year</label>
          <input type="text" className="form-input" placeholder="e.g. B.Tech III" value={newStudent.degree} onChange={e => setNewStudent({ ...newStudent, degree: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <input type="text" className="form-input" placeholder="e.g. Computer Science" value={newStudent.dept} onChange={e => setNewStudent({ ...newStudent, dept: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
