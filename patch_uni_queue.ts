import fs from 'fs'

const file = 'src/app/university/queue/[id]/page.tsx'
const content = `'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getChallengeById } from '@/app/actions/challenges'
import { createProjectFromChallenge } from '@/app/actions/projects'
import { useAuth } from '@/lib/authContext'
import Link from 'next/link'
import styles from './page.module.css'

export default function QueueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { user } = useAuth()
  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [mentor, setMentor] = useState('Prof. Anita Sharma')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getChallengeById(id)
      setSub(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className={styles.page}>
       <div className={styles.breadcrumb}><span className="text-secondary">Loading...</span></div>
    </div>
  )

  if (!sub) return (
    <div className="empty-state" style={{ padding: 'var(--space-20)' }}>
      <div className="empty-state-mark">?</div>
      <h5>Challenge not found</h5>
      <Link href="/university/queue" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-4)' }}>Back to Queue</Link>
    </div>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Create project using actual server action
    const res = await createProjectFromChallenge(
      sub.id,
      user?.institution?.id || 'INST-001',
      user?.id || 'U-UNI-001'
    )
    if (res.success) {
      setSubmitted(true)
    } else {
      alert('Failed to accept: ' + res.error)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/university" className="btn btn-ghost btn-sm">← Back to Dashboard</Link>
      </div>

      <div className={styles.layout}>
        {/* Left: challenge info */}
        <div className={styles.left}>
          <div className="card">
            <div className="card-header">
              <span className="text-xs text-tertiary font-medium" style={{ letterSpacing: 'var(--tracking-wider)' }}>{sub.id}</span>
              <h1 className={styles.title}>{sub.title}</h1>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="tag tag-accent">{sub.domain}</span>
                <span className="tag">{sub.district}</span>
                <span className="badge badge-verification">Urgency: {sub.urgency_score}</span>
              </div>
            </div>
            <div className="card-body">
              <p className="text-sm">{sub.description}</p>
              <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <span className="text-xs text-secondary">Urgency</span>
                  <p className="text-xl font-bold" style={{ color: 'var(--cf-800)' }}>{sub.urgency_score}</p>
                </div>
                <div>
                  <span className="text-xs text-secondary">Submitted</span>
                  <p className="text-sm font-medium">{new Date(sub.submitted_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-xs text-secondary">Status</span>
                  <p className="text-sm font-medium">{sub.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Accept Form */}
        <div className={styles.right}>
          <div className="card">
            {submitted ? (
              <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--ai-50)', color: 'var(--ai-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', fontSize: '1.25rem' }}>✓</div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--cf-800)', marginBottom: 'var(--space-2)' }}>Challenge Accepted</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-5)' }}>
                  A project repository has been created. You can now build your student team and define milestones.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Link href="/university/projects" className="btn btn-primary btn-sm">Go to Project Workspace</Link>
                  <Link href="/university" className="btn btn-ghost btn-sm">Return to Dashboard</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-body">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Accept & Convert to Project</h3>
                </div>
                
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="text-xs font-semibold text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Assigned Faculty Mentor</label>
                  <select 
                    className="input" 
                    value={mentor} 
                    onChange={e => setMentor(e.target.value)}
                    style={{ width: '100%', appearance: 'auto' }}
                  >
                    <option>Prof. Anita Sharma (AI/ML)</option>
                    <option>Dr. V. K. Singh (IoT/Hardware)</option>
                    <option>Prof. Rajesh Kumar (Civil Eng)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="text-xs font-semibold text-secondary" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Required Expertise</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {(sub.ai_keywords || '').split(',').map((kw: string) => kw ? <span key={kw} className="tag tag-accent">{kw}</span> : null)}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: 'var(--space-5)' }}>
                  <p className="text-xs text-secondary">
                    By accepting, this challenge moves from the allocation queue into your active project portfolio. 
                    The citizen who reported this will be notified.
                  </p>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Accept Challenge
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
`

fs.writeFileSync(file, content, 'utf8')
console.log('OK')
