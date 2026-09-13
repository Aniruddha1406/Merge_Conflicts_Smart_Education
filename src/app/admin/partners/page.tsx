'use client'

import { INDUSTRY_PARTNERS } from '@/lib/mockData'
import { useStore } from '@/lib/store'
import styles from './page.module.css'

export default function PartnersPage() {
  const { state } = useStore()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Industry & CSR Partners</h1>
        <p className={styles.subtitle}>{INDUSTRY_PARTNERS.length} registered funding and co-development partners</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Sector</th>
                <th>CSR Focus Areas</th>
                <th>Total Committed</th>
                <th>Active Commitments</th>
                <th>Capabilities</th>
              </tr>
            </thead>
            <tbody>
              {INDUSTRY_PARTNERS.map(p => {
                const partnerCommitments = state.commitments.filter(c => c.partnerId === p.id)
                const totalCommitted = partnerCommitments.reduce((s, c) => s + c.amountLakhs, 0) || p.totalFundingCrore * 100
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--ai-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--cf-800)', flexShrink: 0 }}>{p.name[0]}</div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>{p.name}</p>
                          <p className="text-xs text-secondary">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="tag">{p.sector}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                        {p.csrFocusAreas.slice(0, 2).map(a => <span key={a} className="tag tag-accent text-xs">{a}</span>)}
                        {p.csrFocusAreas.length > 2 && <span className="tag text-xs">+{p.csrFocusAreas.length - 2}</span>}
                      </div>
                    </td>
                    <td className="text-sm font-semibold" style={{ color: 'var(--cf-800)' }}>₹{p.totalFundingCrore}Cr</td>
                    <td className="text-sm">{p.activeCommitments}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                        {p.capabilities.slice(0, 2).map(c => <span key={c} className="tag text-xs">{c}</span>)}
                        {p.capabilities.length > 2 && <span className="tag text-xs">+{p.capabilities.length - 2}</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
