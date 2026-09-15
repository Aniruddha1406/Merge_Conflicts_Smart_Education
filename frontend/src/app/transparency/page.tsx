// src/app/transparency/page.tsx
// Public Transparency & Impact Portal

import Link from 'next/link'
import { getDashboardData, getAllChallenges } from '@/app/actions/challenges'

export const dynamic = 'force-dynamic'

export default async function PublicTransparencyPage() {
  const stats = await getDashboardData()
  const challenges = await getAllChallenges()
  const recentChallenges = challenges.slice(0, 15)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="tag tag-accent">Public Audit & Transparency</span>
          <span className="text-xs text-secondary">Govt. of Jharkhand • Department of Higher & Technical Education</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--cf-800)', marginBottom: '0.75rem' }}>
          Societal Innovation Impact & Resolution Portal
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto' }}>
          Real-time open tracking of crowdsourced civic challenges, university R&D routing, Academic Bank of Credits (ABC) points, and community deployment results across Jharkhand.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span className="text-xs text-secondary block mb-1">Total Crowdsourced Issues</span>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cf-800)' }}>{stats.totalSubmissions}</p>
          <span className="text-xs" style={{ color: '#10B981' }}>{stats.districtsCovered} districts reporting</span>
        </div>

        <div className="card p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span className="text-xs text-secondary block mb-1">Active R&D Projects</span>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>{stats.projectsActive + stats.inProgress}</p>
          <span className="text-xs text-secondary">{stats.institutionsEngaged} HEIs assigned</span>
        </div>

        <div className="card p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span className="text-xs text-secondary block mb-1">Resolved & Verified</span>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{stats.resolvedSubmissions}</p>
          <span className="text-xs text-secondary">{stats.resolutionRate}% resolution rate</span>
        </div>

        <div className="card p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span className="text-xs text-secondary block mb-1">ABC Academic Credits</span>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#8B5CF6' }}>{stats.creditsAwarded}</p>
          <span className="text-xs text-secondary">NEP 2020 aligned</span>
        </div>

        <div className="card p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span className="text-xs text-secondary block mb-1">CSR & Seed Funding</span>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#D97706' }}>₹{stats.fundingCommittedCrore} Cr</p>
          <span className="text-xs text-secondary">{stats.industryPartners} industry partners</span>
        </div>
      </div>

      {/* Two Column Layout: Domain Breakdown & District Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cf-800)', marginBottom: '1rem' }}>
            Domain Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.submissionsByDomain.map((d: any) => {
              const pct = stats.totalSubmissions > 0 ? Math.round((d.count / stats.totalSubmissions) * 100) : 0
              return (
                <div key={d.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span className="font-medium text-cf-800">{d.domain}</span>
                    <span className="text-secondary">{d.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--cf-600, #4A3B32)', borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cf-800)', marginBottom: '1rem' }}>
            District Breakdown (Top 10)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.submissionsByDistrict.map((d: any) => {
              const pct = stats.totalSubmissions > 0 ? Math.round((d.count / stats.totalSubmissions) * 100) : 0
              return (
                <div key={d.district}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span className="font-medium text-cf-800">{d.district}</span>
                    <span className="text-secondary">{d.count} challenges</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct * 2}%`, height: '100%', background: '#3B82F6', borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Live Challenge Audit Table */}
      <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cf-800)' }}>Live Public Audit Feed</h3>
            <p className="text-xs text-secondary">Real-time status of challenges submitted by citizens across Jharkhand</p>
          </div>
          <Link href="/submit" className="btn btn-primary btn-sm">Report a Civic Challenge</Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Title</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Domain</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>District</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Urgency</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Assigned HEI</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentChallenges.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }} className="text-xs font-medium text-secondary">{c.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500, color: 'var(--cf-800)' }}>{c.title}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className="tag tag-accent text-xs">{c.domain}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{c.district}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: c.urgency_score >= 80 ? '#DC2626' : '#2563EB' }}>
                    {c.urgency_score}/100
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {c.assigned_institution_name ? (
                      <span className="text-xs font-medium text-cf-800">{c.assigned_institution_name}</span>
                    ) : (
                      <span className="text-xs text-secondary">In Routing Queue</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span className={`badge ${
                      c.status === 'Resolved' ? 'badge-resolved' :
                      c.status === 'In Progress' ? 'badge-inprogress' :
                      c.status === 'Assigned to Institution' ? 'badge-assigned' : 'badge-submitted'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/" className="btn btn-outline">← Back to Main Dashboard</Link>
      </div>
    </div>
  )
}
