'use client'

import { useState } from 'react'

import { useStore } from '@/lib/store'
import { NotificationType } from '@/lib/store'
import styles from './page.module.css'

const TYPE_LABELS: Record<NotificationType, string> = {
  new_submission: 'New Submission',
  assigned: 'Assignment',
  milestone_complete: 'Milestone',
  verification_requested: 'Verification',
  merged: 'Merge',
  resolved: 'Resolved',
}

const TYPE_BADGE: Record<NotificationType, string> = {
  new_submission: 'badge-submitted',
  assigned: 'badge-assigned',
  milestone_complete: 'badge-resolved',
  verification_requested: 'badge-verification',
  merged: 'badge-review',
  resolved: 'badge-resolved',
}

export default function NotificationsPage() {
  const { state, markRead, markAllRead } = useStore()
  const [filter, setFilter] = useState<'all' | NotificationType>('all')
  const notifications = state.notifications.filter(n => filter === 'all' || n.type === filter)
  const unread = state.notifications.filter(n => !n.read).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notification Centre</h1>
          <p className={styles.subtitle}>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={markAllRead} disabled={unread === 0}>
          Mark All as Read
        </button>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        {['all', 'new_submission', 'assigned', 'milestone_complete', 'verification_requested', 'merged', 'resolved'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f as typeof filter)}
          >
            {f === 'all' ? 'All' : TYPE_LABELS[f as NotificationType]}
          </button>
        ))}
      </div>

      <div className={styles.notifList}>
        {notifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-mark">0</div>
            <h5>No notifications</h5>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`${styles.notifRow} ${!n.read ? styles.unread : ''}`}
            onClick={() => markRead(n.id)}
          >
            <div className={styles.notifMeta}>
              <span className={`badge ${TYPE_BADGE[n.type]}`}>{TYPE_LABELS[n.type]}</span>
              <span className="text-xs text-tertiary">
                {new Date(n.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              {!n.read && <span className={styles.unreadDot} />}
            </div>
            <h3 className={styles.notifTitle}>{n.title}</h3>
            <p className="text-sm text-secondary">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
