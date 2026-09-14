'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getValidatedChallengesForAllocation,
  getRoutingRecommendationsForChallenge,
  assignChallenge,
  generateRoutingForChallenge,
} from '@/app/actions/challenges'
import Link from 'next/link'

interface Rec {
  institutionId: string
  institutionName: string
  fitScore: number
  matchBasis: string[]
  location: string
}

interface ChallengeRow {
  id: string
  title: string
  description: string
  domain: string
  district: string
  urgency_score: number
  ai_triage: string | null
  ai_technical_core: string | null
  ai_academic_field: string | null
  ai_confidence: number | null
  recs: Rec[]
}

export default function AdminAllocationPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await getValidatedChallengesForAllocation()
      const enriched = await Promise.all(
        rows.map(async (c: any) => {
          let recs = await getRoutingRecommendationsForChallenge(c.id)
          if (recs.length === 0 && c.domain) {
            await generateRoutingForChallenge(c.id, c.domain, (c.ai_keywords || '').split(',').filter(Boolean), c.urgency_score, c.district)
            recs = await getRoutingRecommendationsForChallenge(c.id)
          }
          return { ...c, recs: recs.slice(0, 3) } as ChallengeRow
        })
      )
      setChallenges(enriched.filter(c => !done.has(c.id)))
    } catch (e) {
      console.error('Failed to load allocation data', e)
    }
    setLoading(false)
  }, [done])

  useEffect(() => { loadData() }, [loadData])

  const handleAssign = async (challengeId: string, rec: Rec) => {
    setAssigning(challengeId)
    const result = await assignChallenge(challengeId, rec.institutionId, rec.institutionName, rec.fitScore)
    if (result.success) {
      setDone(prev => new Set(prev).add(challengeId))
      setMsg({ id: challengeId, text: `Assigned to ${rec.institutionName}`, ok: true })
    } else {
      setMsg({ id: challengeId, text: result.error || 'Assignment failed', ok: false })
    }
    setAssigning(null)
    setTimeout(() => setMsg(null), 5000)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cf-800)', marginBottom: '0.25rem' }}>University Allocation</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {loading ? 'Loading from database…' : `${challenges.length} validated challenge(s) pending assignment`}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Routing scores: 50% disciplinary alignment + 30% geographic proximity + 20% institutional bandwidth (local algorithm, not ML)
          </p>
        </div>
        <Link href="/admin/submissions" className="btn btn-outline btn-sm">← Submissions</Link>
      </div>

      {msg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem',
          background: msg.ok ? '#D1FAE5' : '#FEE2E2', color: msg.ok ? '#065F46' : '#B91C1C' }}>
          {msg.ok ? '✓ ' : '⚠ '}{msg.text}
        </div>
      )}

      {!loading && challenges.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>
            No validated challenges pending assignment.{' '}
            <Link href="/admin/submissions" style={{ color: 'var(--cf-700)' }}>Validate challenges</Link> first.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {challenges.map(c => (
          <div key={c.id} className="card">
            <div className="card-header">
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {c.id} · {c.domain} · {c.district}
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cf-800)', margin: '0.25rem 0' }}>{c.title}</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {c.description?.slice(0, 200)}{c.description?.length > 200 ? '…' : ''}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                {c.ai_triage && (
                  <span className={`badge ${c.ai_triage === 'INNOVATION_CHALLENGE' ? 'badge-assigned' : 'badge-review'}`}>
                    {c.ai_triage === 'INNOVATION_CHALLENGE' ? 'R&D Innovation' : 'Administrative'}
                  </span>
                )}
                <span className="badge badge-verification">Urgency: {c.urgency_score}</span>
                {c.ai_confidence != null && (
                  <span style={{ color: c.ai_confidence >= 0.7 ? '#059669' : '#D97706' }}>
                    AI Conf: {Math.round(c.ai_confidence * 100)}%
                  </span>
                )}
              </div>
              {c.ai_technical_core && (
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--cf-700)', fontStyle: 'italic' }}>
                  Technical Core: {c.ai_technical_core}
                </p>
              )}
              {c.ai_academic_field && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Academic Field: <strong>{c.ai_academic_field}</strong>
                </p>
              )}
            </div>

            <div className="card-body">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
                Recommended Institutions (DB)
              </p>
              {c.recs.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No routing recommendations found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {c.recs.map((rec, idx) => (
                    <div key={rec.institutionId} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      padding: '0.75rem 1rem', borderRadius: '8px',
                      background: idx === 0 ? '#F0FDF4' : '#F9FAFB',
                      border: `1px solid ${idx === 0 ? '#BBF7D0' : '#E5E7EB'}`,
                    }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: idx === 0 ? '#059669' : '#9CA3AF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rec.institutionName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {rec.location} · Fit: <strong>{Math.round(rec.fitScore * 100)}%</strong>
                        </div>
                        {rec.matchBasis.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                            {rec.matchBasis.map(b => (
                              <span key={b} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'white', border: '1px solid #D1D5DB', borderRadius: '3px' }}>{b}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ width: '70px' }}>
                        <div style={{ height: '5px', borderRadius: '3px', background: '#E5E7EB' }}>
                          <div style={{ height: '100%', width: `${rec.fitScore * 100}%`, background: idx === 0 ? '#059669' : '#6366F1', borderRadius: '3px' }} />
                        </div>
                      </div>
                      <button
                        className={`btn btn-sm ${idx === 0 ? 'btn-primary' : 'btn-outline'}`}
                        disabled={assigning === c.id}
                        onClick={() => handleAssign(c.id, rec)}
                        style={{ whiteSpace: 'nowrap', minWidth: '80px' }}
                      >
                        {assigning === c.id ? 'Assigning…' : `Assign`}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
