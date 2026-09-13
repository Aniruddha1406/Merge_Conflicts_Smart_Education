'use client'

import { useState } from 'react'
import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import styles from './page.module.css'

export default function IndustryProfilePage() {
  const partner = INDUSTRY_PARTNERS[0]
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [contact, setContact] = useState({ website: 'https://www.tataprojects.com', phone: '+91 22 6665 7000', email: 'csr@tataprojects.com' })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Partner Profile</h1>
      <div className={styles.layout}>
        <div className={styles.infoCard}>
          <div className={styles.partnerHeader}>
            <div className={styles.partnerIcon}>{partner.name[0]}</div>
            <div>
              <h2 className={styles.partnerName}>{partner.name}</h2>
              <p className={styles.partnerSector}>{partner.sector}</p>
            </div>
          </div>
          <div className={styles.section}>
            <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>CSR Focus Areas</span>
            <div className={styles.tagList}>{partner.csrFocusAreas.map(a => <span key={a} className="tag tag-accent">{a}</span>)}</div>
          </div>
          <div className={styles.section}>
            <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Capabilities</span>
            <div className={styles.tagList}>{partner.capabilities.map(c => <span key={c} className="tag">{c}</span>)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Total Committed</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--ai-400)', fontFamily: 'var(--font-display)' }}>₹{partner.totalFundingCrore}Cr</p>
            </div>
            <div>
              <span className="text-xs text-secondary font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)' }}>Active Projects</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--ai-400)', fontFamily: 'var(--font-display)' }}>{partner.activeCommitments}</p>
            </div>
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
              <div className="card-footer"><span className="text-sm font-semibold" style={{ color: 'var(--ai-700)' }}>Saved.</span></div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
