'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'
import Modal from '@/components/Modal'
import styles from './page.module.css'

// Dynamically import the map so it only runs on the client to avoid SSR window errors
const DynamicMap = dynamic(() => import('@/components/DynamicMap'), { ssr: false })

const DISTRICTS = ['All', 'Latehar', 'Khunti', 'Gumla', 'Simdega', 'Ranchi', 'West Singhbhum', 'Dhanbad', 'Ramgarh']

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

export default function CommunityMapPage() {
  const { state, endorse } = useStore()
  const [district, setDistrict] = useState('All')
  const [endorsed, setEndorsed] = useState<Set<string>>(new Set())
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = useMemo(() =>
    state.submissions.filter(s => district === 'All' || s.district === district),
    [state.submissions, district]
  )

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {}
    filtered.forEach(s => {
      if (!g[s.district]) g[s.district] = []
      g[s.district].push(s)
    })
    return g
  }, [filtered])

  function handleEndorse(id: string) {
    endorse(id)
    setEndorsed(prev => new Set(prev).add(id))
    setConfirmId(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Community Challenges Map</h1>
          <p className={styles.subtitle}>Browse challenges across Jharkhand. Endorse existing reports instead of duplicating them.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar: district filter + cards */}
        <div className={styles.sidebar}>
          <div className={styles.districtFilter}>
            {DISTRICTS.map(d => (
              <button
                key={d}
                className={`btn btn-sm ${district === d ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDistrict(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <div className={styles.cardList}>
            {Object.entries(grouped).map(([dist, subs]) => (
              <div key={dist}>
                <div className={styles.districtHeading}>{dist}</div>
                {subs.map(s => (
                  <div className="card" key={s.id} style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <h3 className={styles.cardTitle}>{s.title}</h3>
                        <span className={`badge ${STATUS_BADGE[s.status]}`} style={{ flexShrink: 0 }}>{s.status}</span>
                      </div>
                      <span className="tag tag-accent" style={{ marginBottom: 'var(--space-3)', display: 'inline-flex' }}>{s.domain}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-xs text-secondary">{s.endorsements + (endorsed.has(s.id) ? 1 : 0)} endorsements</span>
                        {endorsed.has(s.id) ? (
                          <span className="text-xs font-semibold" style={{ color: 'var(--ai-700)' }}>Endorsed</span>
                        ) : (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setConfirmId(s.id)}
                          >
                            Endorse
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
                <div className="empty-state-mark">0</div>
                <h5>No challenges in this district</h5>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Leaflet Map Area */}
        <div className={styles.mapArea} style={{ position: 'relative' }}>
          <div className={styles.mapLabel} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1000, background: 'white', padding: '8px 12px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Jharkhand — Challenge Distribution
          </div>
          
          <div style={{ flex: 1, width: '100%', minHeight: '360px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <DynamicMap submissions={filtered} />
          </div>

          <div className={styles.mapLegend} style={{ position: 'absolute', bottom: '24px', left: '16px', zIndex: 1000, background: 'white', padding: '8px 12px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', gap: '16px' }}>
            <div className={styles.legendItem} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.legendDot} style={{ background: '#ef4444', width: '12px', height: '12px', borderRadius: '50%' }} /> 
              <span className="text-xs">High Urgency (&gt;85)</span>
            </div>
            <div className={styles.legendItem} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.legendDot} style={{ background: '#3b82f6', width: '12px', height: '12px', borderRadius: '50%' }} /> 
              <span className="text-xs">Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Endorse confirmation modal */}
      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Endorse this Challenge"
        size="sm"
        footer={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
            <button className="btn btn-secondary btn-sm" onClick={() => confirmId && handleEndorse(confirmId)}>Confirm Endorsement</button>
          </>
        }
      >
        <p className="text-sm text-secondary">
          Endorsing this challenge signals that the problem is genuine and affects your community. Your endorsement increases the urgency score and prioritises routing to an institution.
        </p>
      </Modal>
    </div>
  )
}
