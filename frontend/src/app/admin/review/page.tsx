'use client'

import { useState } from 'react'

import { useStore } from '@/lib/store'
import styles from './page.module.css'

export default function AdminReviewPage() {
  const { state, mergeCluster } = useStore()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const clusters = state.clusters.filter(c => !state.mergedClusterIds.includes(c.primaryId) && !dismissed.has(c.primaryId))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Deduplication Review Queue</h1>
          <p className={styles.subtitle}>The NLP engine has grouped semantically similar submissions. Merge duplicates to consolidate urgency and prevent redundant routing.</p>
        </div>
        <span className="badge badge-verification">{clusters.length} cluster{clusters.length !== 1 ? 's' : ''} pending</span>
      </div>

      {clusters.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-mark">✓</div>
          <h5>All duplicate clusters resolved</h5>
          <p>No pending deduplication actions. The queue is clear.</p>
        </div>
      )}

      <div className={styles.clusterList}>
        {clusters.map(cluster => {
          const primary = state.submissions.find(s => s.id === cluster.primaryId)
          return (
            <div className="card" key={cluster.primaryId}>
              <div className="card-header" style={{ background: 'var(--warm-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                      <span className="text-xs font-semibold uppercase" style={{ letterSpacing: 'var(--tracking-wider)', color: 'var(--text-tertiary)' }}>Primary Report: {cluster.primaryId}</span>
                      <span className="tag">{cluster.district}</span>
                    </div>
                    <h3 className={styles.clusterTitle}>{primary?.title ?? cluster.primaryId}</h3>
                  </div>
                  <div className={styles.metricsBox}>
                    <div className={styles.metricItem}>
                      <span className="text-xs text-secondary">Merged Urgency</span>
                      <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--cf-800)' }}>{cluster.mergedUrgency}</span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className="text-xs text-secondary">Merged Endorsements</span>
                      <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ai-700)' }}>{cluster.mergedEndorsements}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <p className="text-sm font-semibold text-secondary" style={{ marginBottom: 'var(--space-3)' }}>
                  Detected Duplicates ({cluster.relatedIds.length})
                </p>
                <div className={styles.duplicateList}>
                  {cluster.similarityScores.map(sim => (
                    <div key={sim.id} className={styles.duplicateRow}>
                      <div className={styles.scoreTag} style={{ background: sim.score >= 0.9 ? 'var(--cf-100)' : 'var(--ai-100)', color: sim.score >= 0.9 ? 'var(--cf-800)' : 'var(--ai-800)' }}>
                        <span className="text-xs font-bold">{Math.round(sim.score * 100)}%</span>
                        <span className="text-xs">match</span>
                      </div>
                      <p className="text-sm">{sim.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-footer" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDismissed(d => new Set(d).add(cluster.primaryId))}>
                  Keep Separate
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => mergeCluster(cluster.primaryId)}>
                  Merge Cluster & Boost Urgency
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
