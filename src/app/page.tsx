'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth, UserRole } from '@/lib/authContext'
import { DASHBOARD_STATS } from '@/lib/mockData'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function LandingPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [demoRole, setDemoRole] = useState<UserRole>('citizen')

  function handleDemoLogin() {
    login(demoRole)
    const routes: Record<UserRole, string> = {
      citizen: '/citizen',
      university: '/university',
      industry: '/industry',
      government: '/admin',
      superadmin: '/admin',
    }
    router.push(routes[demoRole])
  }

  return (
    <div className={styles.page}>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 20 C10 14 16 12 16 16 C16 20 22 18 22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="10" cy="21" r="2" fill="currentColor"/>
              <circle cx="22" cy="11" r="2" fill="currentColor"/>
            </svg>
            <div>
              <span className={styles.navTitle}>SICP</span>
              <span className={styles.navSub}>Jharkhand</span>
            </div>
          </div>
          <div className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#impact" className={styles.navLink}>Impact</a>
            <a href="#about" className={styles.navLink}>About</a>
            <Link href="/submit" className="btn btn-outline btn-sm">Submit a Challenge</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className="badge badge-assigned">NEP 2020 Aligned Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
            Turning Societal Challenges<br />
            <span className={styles.heroAccent}>into Collaborative Solutions</span>
          </h1>
          <p className={styles.heroDesc}>
            The Societal Innovation Collaboration Portal connects citizens of Jharkhand with Higher Education Institutions and industry partners to research, innovate, and deploy solutions to real local challenges — from water access to healthcare, agriculture to accessibility.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/submit" className="btn btn-secondary btn-lg">Submit a Challenge</Link>
            <Link href="/transparency" className="btn btn-outline btn-lg">View Public Dashboard</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <span className={styles.heroCardDot} />
              <span className="text-sm font-medium">Live Challenge</span>
            </div>
            <p className={styles.heroCardTitle}>Non-functional hand pumps in Barwadih block</p>
            <div className={styles.heroCardMeta}>
              <span className="badge badge-verification">Pending Verification</span>
              <span className="text-xs text-secondary">Latehar District</span>
            </div>
            <div className={styles.heroCardScore}>
              <span className="text-xs text-secondary">Fit Score — BIT Mesra</span>
              <div className="progress-bar" style={{ marginTop: '6px' }}>
                <div className="progress-bar-fill fill-dark" style={{ width: '87%' }} />
              </div>
              <span className="text-xs font-semibold" style={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>87%</span>
            </div>
            <div className={styles.heroCardFooter}>
              <span className="text-xs text-tertiary">47 endorsements</span>
              <span className="tag tag-accent">Water &amp; Sanitation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className={styles.statsStrip}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { value: DASHBOARD_STATS.totalSubmissions.toLocaleString(), label: 'Challenges Submitted' },
              { value: DASHBOARD_STATS.resolvedSubmissions.toLocaleString(), label: 'Resolved' },
              { value: DASHBOARD_STATS.institutionsEngaged.toString(), label: 'HEIs Engaged' },
              { value: DASHBOARD_STATS.industryPartners.toString(), label: 'Industry Partners' },
              { value: DASHBOARD_STATS.districtsCovered.toString(), label: 'Districts Covered' },
              { value: DASHBOARD_STATS.creditsAwarded.toLocaleString(), label: 'ABC Credits Awarded' },
            ].map((s) => (
              <div className={styles.statItem} key={s.label}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={styles.howSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>The Process</p>
            <h2 className={styles.sectionTitle}>From Ground Reality to Grounded Solution</h2>
            <p className={styles.sectionDesc}>
              A structured four-step pipeline routes every challenge from citizen submission to verified, on-ground resolution.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              {
                num: '01',
                title: 'Submit a Challenge',
                desc: 'Citizens, Panchayati Raj Institutions, and Urban Local Bodies submit challenges by text, voice note (Hindi, Santhali, Ho, Mundari), photo, or video — with auto-captured geolocation.',
              },
              {
                num: '02',
                title: 'AI Categorises and Routes',
                desc: 'An AI pipeline transcribes, translates, deduplicates, and clusters similar reports. Validated challenges are matched to the best-fit Higher Education Institutions using semantic fit scores.',
              },
              {
                num: '03',
                title: 'Institutions and Industry Collaborate',
                desc: 'Universities form multidisciplinary student–faculty teams. Industry partners co-develop, fund, and mentor projects. Student hours are logged against NEP 2020 Academic Bank of Credits milestones.',
              },
              {
                num: '04',
                title: 'Resolve and Verify',
                desc: 'Before a challenge is marked resolved, the original reporter submits a geo-tagged, time-stamped photo confirming the fix. The platform locks closure until this evidence is verified.',
              },
            ].map((step) => (
              <div className={styles.stepCard} key={step.num}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section className={styles.domainsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Challenge Domains</p>
            <h2 className={styles.sectionTitle}>Across Every Dimension of Civic Life</h2>
          </div>
          <div className={styles.domainsGrid}>
            {DASHBOARD_STATS.submissionsByDomain.map((d) => (
              <div className={styles.domainItem} key={d.domain}>
                <div className={styles.domainBar}>
                  <div
                    className={styles.domainBarFill}
                    style={{
                      width: `${Math.round((d.count / 284) * 100)}%`,
                    }}
                  />
                </div>
                <div className={styles.domainInfo}>
                  <span className={styles.domainName}>{d.domain}</span>
                  <span className={styles.domainCount}>{d.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL CARDS ── */}
      <section className={styles.portalsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Role-Based Access</p>
            <h2 className={styles.sectionTitle}>One Platform, Five Portals</h2>
            <p className={styles.sectionDesc}>
              Each stakeholder group has a dedicated, purpose-built workspace.
            </p>
          </div>
          <div className={styles.portalsGrid}>
            {[
              {
                role: 'citizen' as UserRole,
                label: 'Citizen Portal',
                desc: 'Submit challenges, track your reports, endorse others, and verify resolutions.',
                href: '/citizen',
              },
              {
                role: 'university' as UserRole,
                label: 'University Portal',
                desc: 'Review incoming challenges, form teams, manage projects, and generate ABC credit reports.',
                href: '/university',
              },
              {
                role: 'industry' as UserRole,
                label: 'Industry Portal',
                desc: 'Browse open challenges, commit funding and mentorship, co-develop prototypes.',
                href: '/industry',
              },
              {
                role: 'government' as UserRole,
                label: 'Government Admin',
                desc: 'Oversee all submissions, analytics, moderation, and platform-wide reporting.',
                href: '/admin',
              },
            ].map((p) => (
              <div className={styles.portalCard} key={p.role}>
                <h3 className={styles.portalCardTitle}>{p.label}</h3>
                <p className={styles.portalCardDesc}>{p.desc}</p>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    login(p.role)
                    router.push(p.href)
                  }}
                >
                  Enter as Demo
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className={styles.partnersSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Partner Institutions</p>
            <h2 className={styles.sectionTitle}>Leading Knowledge Partners</h2>
          </div>
          <div className={styles.partnersRow}>
            {['BIT Mesra', 'IIT (ISM) Dhanbad', 'NIT Jamshedpur', 'RIMS Ranchi', 'XLRI Jamshedpur', 'Vinoba Bhave University'].map((name) => (
              <div className={styles.partnerPlaceholder} key={name}>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / NEP ── */}
      <section id="about" className={styles.aboutSection}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <p className={styles.sectionEyebrow}>NEP 2020 Alignment</p>
              <h2 className={styles.aboutTitle}>Building India&apos;s First Demand-Linked Societal Innovation Ecosystem</h2>
              <p className={styles.aboutDesc}>
                The National Education Policy 2020 mandates that universities engage deeply with society and link academic work to real community needs. SICP operationalises this mandate for Jharkhand — every student project on the platform is mapped to the Academic Bank of Credits framework, ensuring verified, portable credit recognition.
              </p>
              <p className={styles.aboutDesc}>
                By combining vernacular-first citizen ingestion, AI-assisted routing, and geo-fenced proof of impact, the portal creates an accountable pipeline from problem identification to on-ground resolution — with full transparency at every step.
              </p>
              <Link href="/about" className="btn btn-primary">Read the Full Framework</Link>
            </div>
            <div className={styles.aboutStats}>
              {[
                { label: 'Resolution Rate', value: `${DASHBOARD_STATS.resolutionRate}%` },
                { label: 'Avg. Days to Assign', value: `${DASHBOARD_STATS.avgTimeToAssign}` },
                { label: 'Patents Filed', value: DASHBOARD_STATS.patentsFiled.toString() },
                { label: 'Startups Spawned', value: DASHBOARD_STATS.startupsSpawned.toString() },
              ].map((s) => (
                <div className={styles.aboutStatItem} key={s.label}>
                  <div className={styles.aboutStatValue}>{s.value}</div>
                  <div className={styles.aboutStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO LOGIN ── */}
      <section className={styles.demoSection}>
        <div className="container">
          <div className={styles.demoCard}>
            <h2 className={styles.demoTitle}>Explore the Platform</h2>
            <p className={styles.demoDesc}>
              Select a role and enter the demo portal — no credentials required for evaluation purposes.
            </p>
            <div className={styles.demoRow}>
              <select
                className="form-select"
                style={{ maxWidth: '260px' }}
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value as UserRole)}
                id="demo-role-select"
                aria-label="Select demo role"
              >
                <option value="citizen">Citizen</option>
                <option value="university">University / HEI</option>
                <option value="industry">Industry Partner</option>
                <option value="government">Government Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <button className="btn btn-secondary btn-lg" onClick={handleDemoLogin}>
                Enter Demo Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 20 C10 14 16 12 16 16 C16 20 22 18 22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="10" cy="21" r="2" fill="currentColor"/>
                  <circle cx="22" cy="11" r="2" fill="currentColor"/>
                </svg>
                <span>SICP Jharkhand</span>
              </div>
              <p className={styles.footerTagline}>
                Societal Innovation Collaboration Portal<br />
                Government of Jharkhand
              </p>
            </div>
            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>Platform</h4>
              <Link href="/submit" className={styles.footerLink}>Submit Challenge</Link>
              <Link href="/transparency" className={styles.footerLink}>Transparency Dashboard</Link>
              <Link href="/about" className={styles.footerLink}>About SICP</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>Portals</h4>
              <Link href="/citizen" className={styles.footerLink}>Citizen Portal</Link>
              <Link href="/university" className={styles.footerLink}>University Portal</Link>
              <Link href="/industry" className={styles.footerLink}>Industry Portal</Link>
              <Link href="/admin" className={styles.footerLink}>Government Portal</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>Legal</h4>
              <a href="#" className={styles.footerLink}>Terms of Use</a>
              <a href="#" className={styles.footerLink}>Privacy Policy</a>
              <a href="#" className={styles.footerLink}>Accessibility Statement</a>
              <a href="#" className={styles.footerLink}>RTI</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>
              A Government of Jharkhand initiative under the Department of Higher and Technical Education.
              Built in alignment with NEP 2020.
            </p>
            <p className={styles.footerCopy}>
              SIH 2026 — Problem Statement SIH26043
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
