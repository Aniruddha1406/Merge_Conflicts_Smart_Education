'use client'

import { useState } from 'react'
import { INSTITUTIONS } from '@/lib/mockData'
import styles from './page.module.css'

export default function UniversityProfilePage() {
  const inst = INSTITUTIONS[0] // BIT Mesra for demo
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [contact, setContact] = useState({ website: 'https://www.bitmesra.ac.in', phone: '+91 651 227 5868', email: 'sicp@bitmesra.ac.in' })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Institution Profile</h1>

      <div className={styles.layout}>
        <div className={styles.infoCard}>
          <div className={styles.instHeader}>
            <div className={styles.instIcon}>{inst.shortName[0]}</div>
            <div>
              <h2 className={styles.instName}>{inst.name}</h2>
              <p className={styles.instMeta}>{inst.type} — {inst.location}</p>
            </div>
          </div>

          <div className={styles.section}>
            <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Departments</span>
            <div className={styles.tagList}>
              {inst.departments.map(d => <span key={d} className="tag">{d}</span>)}
            </div>
          </div>

          <div className={styles.section}>
            <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Expertise Tags</span>
            <div className={styles.tagList}>
              {inst.expertiseTags.map(t => <span key={t} className="tag tag-accent">{t}</span>)}
            </div>
          </div>

          <div className={styles.section}>
            <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Incubation Centre</span>
            <span className={`badge ${inst.incubationCenter ? 'badge-resolved' : 'badge-submitted'}`}>
              {inst.incubationCenter ? 'Active' : 'Not Available'}
            </span>
          </div>

          <div className={styles.section}>
            <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Active Projects on SICP</span>
            <p className="text-2xl font-bold" style={{ color: 'var(--cf-800)', fontFamily: 'var(--font-display)' }}>{inst.activeProjects}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.sectionTitle}>Contact Details</h2>
            {!editing && <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button>}
          </div>
          <form onSubmit={handleSave}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {['website', 'phone', 'email'].map(field => (
                <div className="form-group" key={field} style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    className="form-input"
                    value={(contact as Record<string, string>)[field]}
                    onChange={e => setContact(c => ({ ...c, [field]: e.target.value }))}
                    readOnly={!editing}
                    style={!editing ? { background: 'var(--warm-50)' } : {}}
                  />
                </div>
              ))}
            </div>
            {editing && (
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
              </div>
            )}
            {saved && !editing && (
              <div className="card-footer">
                <span className="text-sm font-semibold" style={{ color: 'var(--ai-700)' }}>Changes saved successfully.</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
