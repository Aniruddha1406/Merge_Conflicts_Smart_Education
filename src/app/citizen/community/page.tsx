'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import Modal from '@/components/Modal'
import styles from './page.module.css'

const DISTRICTS = ['All', 'Latehar', 'Khunti', 'Gumla', 'Simdega', 'Ranchi', 'West Singhbhum', 'Dhanbad', 'Ramgarh']

const STATUS_BADGE: Record<string, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

// Simplified district pin positions on the SVG placeholder (rough relative positions)
const DISTRICT_PINS: Record<string, { x: string; y: string }> = {
  'Ranchi':          { x: '48%', y: '52%' },
  'Latehar':         { x: '36%', y: '48%' },
  'Khunti':          { x: '43%', y: '58%' },
  'Gumla':           { x: '34%', y: '58%' },
  'Simdega':         { x: '28%', y: '65%' },
  'West Singhbhum':  { x: '22%', y: '72%' },
  'Dhanbad':         { x: '72%', y: '32%' },
  'Ramgarh':         { x: '58%', y: '40%' },
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

        {/* SVG Map placeholder */}
        <div className={styles.mapArea}>
          <div className={styles.mapLabel}>Jharkhand — Challenge Distribution</div>
          <div className={styles.mapSvgWrap}>
            {/* Simple outlined placeholder of Jharkhand */}
            <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.mapSvg} aria-label="Jharkhand district map">
              {/* Rough Jharkhand outline approximation */}
              <path
                d="M80 40 L180 20 L280 30 L340 80 L360 150 L320 230 L260 280 L200 300 L140 280 L80 240 L40 180 L30 120 Z"
                fill="var(--warm-100)"
                stroke="var(--cf-300)"
                strokeWidth="2"
              />
              {/* District grid lines (decorative) */}
              <line x1="80" y1="160" x2="360" y2="160" stroke="var(--warm-200)" strokeWidth="1" strokeDasharray="4,4"/>
              <line x1="200" y1="20" x2="200" y2="300" stroke="var(--warm-200)" strokeWidth="1" strokeDasharray="4,4"/>
              <line x1="130" y1="20" x2="130" y2="300" stroke="var(--warm-200)" strokeWidth="1" strokeDasharray="4,4"/>
              <line x1="270" y1="20" x2="270" y2="300" stroke="var(--warm-200)" strokeWidth="1" strokeDasharray="4,4"/>
            </svg>

            {/* District pins — positioned absolutely */}
            {state.submissions
              .filter(s => district === 'All' || s.district === district)
              .map(s => {
                const pin = DISTRICT_PINS[s.district]
                if (!pin) return null
                const isHigh = s.urgencyScore >= 85
                return (
                  <div
                    key={s.id}
                    className={styles.pin}
                    style={{ left: pin.x, top: pin.y, '--pin-color': isHigh ? 'var(--cf-800)' : 'var(--ai-500)' } as React.CSSProperties}
                    title={s.title}
                  >
                    <div className={styles.pinDot} style={{ background: isHigh ? 'var(--cf-800)' : 'var(--ai-500)' }} />
                    <div className={styles.pinLabel}>{s.district}</div>
                  </div>
                )
              })
            }
          </div>

          <div className={styles.mapLegend}>
            <div className={styles.legendItem}><span className={styles.legendDot} style={{ background: 'var(--cf-800)' }} /> High Urgency (&gt;85)</div>
            <div className={styles.legendItem}><span className={styles.legendDot} style={{ background: 'var(--ai-500)' }} /> Normal</div>
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
