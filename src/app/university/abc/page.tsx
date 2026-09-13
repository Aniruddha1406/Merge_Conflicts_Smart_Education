'use client'

import { useStore } from '@/lib/store'
import styles from './page.module.css'

export default function ABCPage() {
  const { state } = useStore()
  const projects = state.projects

  // Flatten all students across all projects
  const students = projects.flatMap(p =>
    p.team
      .filter(m => m.role === 'Student')
      .map(m => {
        const hoursLogged = p.milestones
          .filter(ms => ms.completed)
          .reduce((sum, ms) => sum + Math.round(ms.studentHours / (p.team.filter(t => t.role === 'Student').length || 1)), 0)
        const credits = m.creditHours ?? 0
        return {
          ...m,
          project: p.title,
          projectId: p.id,
          hoursLogged,
          credits,
          eligible: credits >= 4,
        }
      })
  )

  const totalHours = students.reduce((sum, s) => sum + s.hoursLogged, 0)
  const totalCredits = students.reduce((sum, s) => sum + s.credits, 0)
  const eligible = students.filter(s => s.eligible).length

  function handleExport() {
    const header = 'Name,Department,Project,Hours Logged,Credits,Eligible\n'
    const rows = students.map(s =>
      `"${s.name}","${s.department}","${s.project}",${s.hoursLogged},${s.credits},${s.eligible ? 'Yes' : 'No'}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'abc-compliance-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>NEP 2020 — ABC Compliance Report</h1>
          <p className={styles.subtitle}>Academic Bank of Credits tracking for all SICP-linked student projects this semester.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
      </div>

      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-value">{totalHours}</div>
          <div className="stat-card-label">Total Student Hours Logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalCredits}</div>
          <div className="stat-card-label">ABC Credits Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{students.length}</div>
          <div className="stat-card-label">Students Enrolled</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{eligible}</div>
          <div className="stat-card-label">Credit-Eligible Students</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className={styles.sectionTitle}>Student Credit Breakdown</h2>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Department</th>
                <th>Project</th>
                <th>Hours Logged</th>
                <th>Credits Awarded</th>
                <th>ABC Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, color: 'var(--cf-800)' }}>{s.name}</td>
                  <td>{s.department}</td>
                  <td className="text-xs">{s.projectId}</td>
                  <td>{s.hoursLogged}h</td>
                  <td><strong>{s.credits} cr</strong></td>
                  <td>
                    <span className={`badge ${s.eligible ? 'badge-resolved' : 'badge-review'}`}>
                      {s.eligible ? 'Eligible' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
