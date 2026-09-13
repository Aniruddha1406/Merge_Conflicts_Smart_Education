'use client'

import { Submission, SubmissionStatus } from '@/lib/mockData'
import styles from './SubmissionCard.module.css'

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-review',
  'Assigned to Institution': 'badge-assigned',
  'In Progress': 'badge-inprogress',
  'Pending Verification': 'badge-verification',
  'Resolved': 'badge-resolved',
}

interface SubmissionCardProps {
  submission: Submission
  actions?: React.ReactNode
  onClick?: () => void
  compact?: boolean
}

export default function SubmissionCard({ submission: s, actions, onClick, compact }: SubmissionCardProps) {
  return (
    <div
      className={`card ${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="card-body">
        <div className={styles.top}>
          <div className={styles.meta}>
            <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>
              {s.id}
            </span>
            <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>
          </div>
          <h3 className={styles.title}>{s.title}</h3>

          {!compact && (
            <p className={styles.desc}>{s.description}</p>
          )}

          <div className={styles.tags}>
            <span className="tag tag-accent">{s.domain}</span>
            <span className="tag">{s.district}</span>
            {s.village && <span className="tag">{s.village}</span>}
          </div>
        </div>

        <div className={styles.scores}>
          <div className={styles.scoreItem}>
            <span className="text-xs text-secondary">Urgency</span>
            <div className={styles.scoreRow}>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div
                  className={`progress-bar-fill ${s.urgencyScore >= 85 ? 'fill-dark' : ''}`}
                  style={{ width: `${s.urgencyScore}%` }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ minWidth: 28, textAlign: 'right' }}>
                {s.urgencyScore}
              </span>
            </div>
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.endorseCount}>
              <span className={styles.endorseDot} />
              <span className="text-xs text-secondary">{s.endorsements} endorsements</span>
            </div>
            {s.assignedInstitution && (
              <span className="text-xs text-secondary">
                {s.assignedInstitution}
                {s.fitScore ? <strong className={styles.fit}> {Math.round(s.fitScore * 100)}% fit</strong> : null}
              </span>
            )}
            <span className="text-xs text-tertiary">
              {new Date(s.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  )
}
