'use client'

import { useStore } from '@/lib/store'
import styles from './page.module.css'

const ALL_FACULTY = ['Prof. Anita Sharma', 'Dr. Meena Toppo', 'Prof. R.K. Singh', 'Dr. S.K. Verma']
const ALL_STUDENTS = [
  { name: 'Ravi Kumar', degree: 'M.Tech III', dept: 'Civil Engineering' },
  { name: 'Priya Ekka', degree: 'M.Tech II', dept: 'Environmental Engineering' },
  { name: 'Deepak Nath', degree: 'B.Tech IV', dept: 'Civil Engineering' },
  { name: 'Sita Minj', degree: 'MBBS Intern', dept: 'Gynaecology' },
  { name: 'Arjun Munda', degree: 'B.Tech III', dept: 'Information Technology' },
  { name: 'Kavita Singh', degree: 'M.Tech I', dept: 'Agriculture Engineering' },
]

export default function TeamsPage() {
  const { state } = useStore()
  const projects = state.projects

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Team Formation</h1>
      <p className={styles.subtitle}>Current team compositions across all active projects. Faculty mentors and student members are shown with their department and credit allocation.</p>

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
                    {p.team.map(m => (
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
          <h2 className={styles.sectionTitle}>Available Faculty</h2>
          <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {ALL_FACULTY.map(f => (
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

          <h2 className={styles.sectionTitle}>Available Students</h2>
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {ALL_STUDENTS.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--warm-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--cf-800)' }}>{s.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-secondary">{s.degree} — {s.dept}</p>
                    </div>
                  </div>
                  <span className="tag">{s.degree.includes('M.Tech') ? 'Postgrad' : s.degree.includes('B.Tech') ? 'Undergrad' : 'Intern'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
