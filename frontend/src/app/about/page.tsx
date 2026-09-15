import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '2rem 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Back to Home
          </Link>
        </div>

        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ padding: '4px 12px', background: 'var(--cf-800)', color: 'white', borderRadius: '999px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Government of Jharkhand
            </span>
            <span style={{ padding: '4px 12px', background: 'var(--ai-50)', color: 'var(--ai-700)', borderRadius: '999px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid var(--ai-200)' }}>
              NEP 2020 Aligned
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: 'var(--cf-800)', lineHeight: 1.2, marginBottom: '1rem' }}>
            Societal Innovation Collaboration Portal
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '700px' }}>
            A Government of Jharkhand initiative operationalising the National Education Policy 2020 mandate for demand-linked, community-facing higher education.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--cf-800)', marginBottom: '1rem' }}>
              Vision &amp; Mandate
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
              The National Education Policy 2020 mandates universities to engage deeply with society, linking academic research to real community needs. SICP operationalises this mandate for the state of Jharkhand — creating a structured pipeline from citizen-reported problems to institution-led solutions verified by the community itself.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              The platform is administered by the Department of Higher and Technical Education, Government of Jharkhand, and is designed to serve the state&apos;s 24 districts and all citizens, educational institutions, industry partners, and government agencies.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--cf-800)', marginBottom: '1rem' }}>
              Key Features
            </h2>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: '1.5rem' }}>
              <li><strong>Vernacular-First Ingestion</strong> — Citizens submit challenges in Hindi, Santhali, Ho, Mundari, or Bengali by voice, text, or media.</li>
              <li><strong>AI-Assisted Classification &amp; Routing</strong> — Local rule-based classifier categorises, deduplicates, and routes challenges to best-fit Higher Education Institutions.</li>
              <li><strong>Duplicate Clustering</strong> — Similar challenges from the same geographic region are merged into Ecosystem Challenge Clusters with aggregated urgency scores.</li>
              <li><strong>NEP 2020 Academic Bank of Credits</strong> — All student project hours are logged and mapped to verifiable ABC credits under the NEP 2020 framework.</li>
              <li><strong>Geo-Fenced Proof of Impact</strong> — Before closure, the original reporter submits a GPS-tagged photograph confirming on-ground resolution.</li>
              <li><strong>Full Transparency</strong> — A public-facing dashboard shows all challenges, their status, and the institutions working on them — in real time.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--cf-800)', marginBottom: '1rem' }}>
              Stakeholders
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { role: 'Citizens', desc: 'Report issues, track submissions, endorse community challenges, verify resolutions.' },
                { role: 'Universities & HEIs', desc: 'Receive assigned challenges, form teams, log project milestones, earn ABC credits.' },
                { role: 'Industry Partners', desc: 'Browse validated challenges, commit CSR funding, mentor student-faculty teams.' },
                { role: 'Government', desc: 'Validate submissions, assign institutions, monitor statewide analytics and resolutions.' },
              ].map((s) => (
                <div key={s.role} style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--cf-800)', marginBottom: '0.5rem' }}>{s.role}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--cf-800)', marginBottom: '1rem' }}>
              Technology Stack
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
              The platform is built as a full-stack web application with a Next.js 16 frontend (App Router) and an Express.js backend connected to a SQLite database. The AI classification pipeline runs locally using rule-based keyword scoring and semantic domain matching — no external API calls required, ensuring data residency within government infrastructure.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Vernacular support is implemented via the Web Speech API with language codes for Hindi (hi-IN), and future expansions for Santhali, Ho, and Mundari are supported by the platform architecture.
            </p>
          </section>

          <div style={{ padding: '2rem', background: 'var(--cf-800)', borderRadius: '16px', color: 'white', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Report a Civic Challenge
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Citizens can submit issues without creating an account. Your report goes directly into the resolution pipeline.
              </p>
            </div>
            <Link href="/submit" className="btn btn-secondary">
              Submit a Challenge →
            </Link>
          </div>
        </div>

        <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>Department of Higher &amp; Technical Education, Government of Jharkhand</span>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>← Back to Portal Home</Link>
        </footer>
      </div>
    </div>
  )
}
