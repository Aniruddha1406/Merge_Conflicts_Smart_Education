'use client'

import { DASHBOARD_STATS } from '@/lib/mockData'
import styles from './page.module.css'

// Submission counts by district, sorted by count desc
const DISTRICTS = [...DASHBOARD_STATS.submissionsByDistrict].sort((a, b) => b.count - a.count)
const MAX_COUNT = DISTRICTS[0].count

// Colour intensity: more submissions = darker shade of Chocolate Fondant
function getShade(count: number): string {
  const pct = count / MAX_COUNT
  if (pct >= 0.9) return 'var(--cf-800)'
  if (pct >= 0.7) return 'var(--cf-600)'
  if (pct >= 0.5) return 'var(--cf-400)'
  if (pct >= 0.3) return 'var(--cf-200)'
  return 'var(--cf-100)'
}

// Approximate SVG positions for each district (x%, y% within the map viewBox)
const DISTRICT_SVG: Record<string, { x: number; y: number; w: number; h: number }> = {
  'Ranchi':          { x: 42, y: 45, w: 12, h: 10 },
  'Dhanbad':         { x: 68, y: 24, w: 10, h: 9 },
  'Latehar':         { x: 30, y: 42, w: 10, h: 10 },
  'Gumla':           { x: 28, y: 52, w: 10, h: 10 },
  'Khunti':          { x: 38, y: 54, w: 9, h: 9 },
  'West Singhbhum':  { x: 18, y: 64, w: 14, h: 12 },
  'Ramgarh':         { x: 54, y: 35, w: 9, h: 8 },
  'Simdega':         { x: 22, y: 60, w: 9, h: 9 },
  'Giridih':         { x: 60, y: 32, w: 9, h: 8 },
  'Hazaribagh':      { x: 50, y: 28, w: 10, h: 9 },
}

export default function HeatmapPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>District Challenge Heatmap</h1>
          <p className={styles.subtitle}>Submission density across Jharkhand's districts. Darker shading indicates higher submission volume.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* SVG Map */}
        <div className={styles.mapCard}>
          <div className={styles.mapLabel}>Jharkhand — Submission Density</div>
          <div className={styles.svgWrap}>
            <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" className={styles.svg}>
              {/* Jharkhand outline */}
              <path
                d="M75 35 L180 15 L290 28 L345 82 L365 155 L325 238 L265 288 L200 308 L135 285 L75 242 L35 182 L25 118 Z"
                fill="var(--warm-100)"
                stroke="var(--cf-300)"
                strokeWidth="2"
              />
              {/* District cells — drawn as rounded rects, shaded by count */}
              {DISTRICT_SVG && Object.entries(DISTRICT_SVG).map(([dist, pos]) => {
                const data = DISTRICTS.find(d => d.district === dist)
                if (!data) return null
                const shade = getShade(data.count)
                const svgX = (pos.x / 100) * 400
                const svgY = (pos.y / 100) * 340
                const svgW = (pos.w / 100) * 400
                const svgH = (pos.h / 100) * 340
                return (
                  <g key={dist}>
                    <rect x={svgX} y={svgY} width={svgW} height={svgH} rx="4" fill={shade} opacity={0.85} />
                    <text x={svgX + svgW / 2} y={svgY + svgH / 2 + 4} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">{dist.split(' ')[0]}</text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {[
              { shade: 'var(--cf-800)', label: '170+' },
              { shade: 'var(--cf-600)', label: '120–169' },
              { shade: 'var(--cf-400)', label: '80–119' },
              { shade: 'var(--cf-200)', label: '40–79' },
              { shade: 'var(--cf-100)', label: '<40' },
            ].map(l => (
              <div key={l.label} className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: l.shade }} />
                <span className="text-xs text-secondary">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Top Districts by Submissions</h2>
          <div className={styles.districtList}>
            {DISTRICTS.map((d, i) => (
              <div key={d.district} className={styles.districtRow}>
                <div className={styles.districtRank}>{i + 1}</div>
                <div className={styles.districtInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <span className="text-sm font-medium">{d.district}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--cf-800)' }}>{d.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill fill-dark" style={{ width: `${(d.count / MAX_COUNT) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
