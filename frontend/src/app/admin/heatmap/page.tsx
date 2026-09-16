'use client'

import { useMemo, useEffect, useState } from 'react'
import { SUBMISSIONS as INITIAL_SUBMISSIONS } from '@/lib/mockData'
import styles from './page.module.css'

// Approximate SVG positions for each district
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

// Vibrant heatmap gradient: green → yellow → orange → red
function getShade(count: number, max: number): string {
  if (max === 0) return '#e8f5e9'
  const pct = count / max
  if (pct >= 0.9) return '#d32f2f'   // Deep Red
  if (pct >= 0.7) return '#f57c00'   // Orange
  if (pct >= 0.5) return '#fbc02d'   // Yellow
  if (pct >= 0.3) return '#66bb6a'   // Medium Green
  return '#a5d6a7'                    // Light Green
}

function getTextColor(count: number, max: number): string {
  if (max === 0) return '#333'
  const pct = count / max
  if (pct >= 0.5) return 'white'
  return '#1b5e20'
}

export default function HeatmapPage() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)

  // Load live submissions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mock_submissions')
    if (stored) {
      try { setSubmissions(JSON.parse(stored)) } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mock_submissions' && e.newValue) {
        try { setSubmissions(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Dynamically compute district counts from live submissions
  const DISTRICTS = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach((s: any) => {
      const d = s.district
      if (d) counts[d] = (counts[d] || 0) + 1
    })
    return Object.entries(counts)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
  }, [submissions])

  const MAX_COUNT = DISTRICTS.length > 0 ? DISTRICTS[0].count : 1

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>District Challenge Heatmap</h1>
          <p className={styles.subtitle}>
            Live submission density across Jharkhand's districts ({submissions.length} total submissions). Darker shading indicates higher volume.
          </p>
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
              {Object.entries(DISTRICT_SVG).map(([dist, pos]) => {
                const data = DISTRICTS.find(d => d.district === dist)
                const count = data?.count || 0
                const shade = getShade(count, MAX_COUNT)
                const svgX = (pos.x / 100) * 400
                const svgY = (pos.y / 100) * 340
                const svgW = (pos.w / 100) * 400
                const svgH = (pos.h / 100) * 340
                return (
                  <g key={dist}>
                    <rect x={svgX} y={svgY} width={svgW} height={svgH} rx="4" fill={shade} opacity={0.85} />
                    <text x={svgX + svgW / 2} y={svgY + svgH / 2 - 2} textAnchor="middle" fontSize="8" fill={getTextColor(count, MAX_COUNT)} fontWeight="600">{dist.split(' ')[0]}</text>
                    <text x={svgX + svgW / 2} y={svgY + svgH / 2 + 10} textAnchor="middle" fontSize="7" fill={getTextColor(count, MAX_COUNT)} fontWeight="500">{count}</text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Dynamic Legend */}
          <div className={styles.legend}>
            {[
              { shade: '#d32f2f', label: `${Math.ceil(MAX_COUNT * 0.9)}+ (Critical)` },
              { shade: '#f57c00', label: `${Math.ceil(MAX_COUNT * 0.7)}–${Math.ceil(MAX_COUNT * 0.9) - 1} (High)` },
              { shade: '#fbc02d', label: `${Math.ceil(MAX_COUNT * 0.5)}–${Math.ceil(MAX_COUNT * 0.7) - 1} (Medium)` },
              { shade: '#66bb6a', label: `${Math.ceil(MAX_COUNT * 0.3)}–${Math.ceil(MAX_COUNT * 0.5) - 1} (Low)` },
              { shade: '#a5d6a7', label: `<${Math.ceil(MAX_COUNT * 0.3)} (Minimal)` },
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
