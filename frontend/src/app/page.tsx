'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth, UserRole } from '@/lib/authContext'
import { DASHBOARD_STATS } from '@/lib/mockData'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { useTranslation } from '@/i18n/useTranslation'
import LanguageSelector from '@/components/LanguageSelector'

export default function LandingPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [demoRole, setDemoRole] = useState<UserRole>('citizen')
  const { t } = useTranslation()

  const ROLES = [
    {
      role: 'citizen' as UserRole,
      label: t('portals.roles.citizen.label'),
      fullLabel: t('portals.roles.citizen.fullLabel'),
      desc: t('portals.roles.citizen.desc'),
      href: '/citizen',
      who: t('portals.roles.citizen.who'),
    },
    {
      role: 'university' as UserRole,
      label: t('portals.roles.university.label'),
      fullLabel: t('portals.roles.university.fullLabel'),
      desc: t('portals.roles.university.desc'),
      href: '/university',
      who: t('portals.roles.university.who'),
    },
    {
      role: 'industry' as UserRole,
      label: t('portals.roles.industry.label'),
      fullLabel: t('portals.roles.industry.fullLabel'),
      desc: t('portals.roles.industry.desc'),
      href: '/industry',
      who: t('portals.roles.industry.who'),
    },
    {
      role: 'government' as UserRole,
      label: t('portals.roles.government.label'),
      fullLabel: t('portals.roles.government.fullLabel'),
      desc: t('portals.roles.government.desc'),
      href: '/admin',
      who: t('portals.roles.government.who'),
    },
  ]

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
            <img src="/srijan-logo.jpg" alt="SRIJAN Logo" width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <span className={styles.navTitle}>{t('nav.title')}</span>
              <span className={styles.navSub}>{t('nav.subtitle')}</span>
            </div>
          </div>
          <div className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>{t('nav.howItWorks')}</a>
            <a href="#portals" className={styles.navLink}>{t('nav.portals')}</a>
            <a href="#impact" className={styles.navLink}>{t('nav.impact')}</a>
            <Link href="/transparency" className={styles.navLink}>{t('nav.publicDashboard')}</Link>
            <LanguageSelector />
            <Link href="/submit" className="btn btn-primary btn-sm">{t('nav.submitChallenge')}</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.govtTag}>{t('hero.govtTag')}</span>
            <span className={styles.nepTag}>{t('hero.nepTag')}</span>
          </div>
          <h1 className={styles.heroTitle}>
            {t('hero.titleMain')}
            <span className={styles.heroAccent}> {t('hero.titleAccent')}</span>
          </h1>
          <p className={styles.heroDesc}>{t('hero.desc')}</p>
          <div className={styles.heroCtas}>
            <Link href="/submit" className="btn btn-secondary btn-lg">{t('hero.btnSubmit')}</Link>
            <Link href="/transparency" className="btn btn-outline btn-lg">{t('hero.btnDashboard')}</Link>
          </div>
          <div className={styles.heroMeta}>
            <span>{t('hero.deptName')}</span>
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
      <section id="impact" className={styles.statsStrip}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { value: DASHBOARD_STATS.totalSubmissions.toLocaleString(), label: t('stats.challengesSubmitted') },
              { value: DASHBOARD_STATS.resolvedSubmissions.toLocaleString(), label: t('stats.resolved') },
              { value: DASHBOARD_STATS.institutionsEngaged.toString(), label: t('stats.heisEngaged') },
              { value: DASHBOARD_STATS.industryPartners.toString(), label: t('stats.industryPartners') },
              { value: DASHBOARD_STATS.districtsCovered.toString(), label: t('stats.districtsCovered') },
              { value: DASHBOARD_STATS.creditsAwarded.toLocaleString(), label: t('stats.creditsAwarded') },
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
            <p className={styles.sectionEyebrow}>{t('process.eyebrow')}</p>
            <h2 className={styles.sectionTitle}>{t('process.title')}</h2>
            <p className={styles.sectionDesc}>{t('process.desc')}</p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { num: '01', title: t('process.step1.title'), desc: t('process.step1.desc') },
              { num: '02', title: t('process.step2.title'), desc: t('process.step2.desc') },
              { num: '03', title: t('process.step3.title'), desc: t('process.step3.desc') },
              { num: '04', title: t('process.step4.title'), desc: t('process.step4.desc') },
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

      {/* ── PORTALS / ROLES ── */}
      <section id="portals" className={styles.portalsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>{t('portals.eyebrow')}</p>
            <h2 className={styles.sectionTitle}>{t('portals.title')}</h2>
            <p className={styles.sectionDesc}>{t('portals.desc')}</p>
          </div>
          <div className={styles.portalsGrid}>
            {ROLES.map((p) => (
              <div className={styles.portalCard} key={p.role}>
                <h3 className={styles.portalCardTitle}>{p.fullLabel}</h3>
                <p className={styles.portalCardWho}>{p.who}</p>
                <p className={styles.portalCardDesc}>{p.desc}</p>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 'auto' }}
                  onClick={() => {
                    login(p.role)
                    router.push(p.href)
                  }}
                >
                  {t('portals.enterBtn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section className={styles.domainsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>{t('domains.eyebrow')}</p>
            <h2 className={styles.sectionTitle}>{t('domains.title')}</h2>
          </div>
          <div className={styles.domainsGrid}>
            {DASHBOARD_STATS.submissionsByDomain.map((d) => (
              <div className={styles.domainItem} key={d.domain}>
                <div className={styles.domainInfo}>
                  <span className={styles.domainName}>{d.domain}</span>
                  <span className={styles.domainCount}>{d.count} {t('domains.challengesCount')}</span>
                </div>
                <div className={styles.domainBar}>
                  <div
                    className={styles.domainBarFill}
                    style={{ width: `${Math.round((d.count / 284) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className={styles.partnersSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>{t('partners.eyebrow')}</p>
            <h2 className={styles.sectionTitle}>{t('partners.title')}</h2>
          </div>
          <div className={styles.partnersRow}>
            {['BIT Mesra', 'IIT (ISM) Dhanbad', 'NIT Jamshedpur', 'Ranchi University', 'XLRI Jamshedpur', 'Vinoba Bhave University', 'CUJ Ranchi'].map((name) => (
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
              <p className={styles.sectionEyebrow}>{t('about.eyebrow')}</p>
              <h2 className={styles.aboutTitle}>{t('about.title')}</h2>
              <p className={styles.aboutDesc}>{t('about.desc1')}</p>
              <p className={styles.aboutDesc}>{t('about.desc2')}</p>
              <Link href="/transparency" className="btn btn-primary">{t('about.btnDashboard')}</Link>
            </div>
            <div className={styles.aboutStats}>
              {[
                { label: t('about.resolutionRate'), value: `${DASHBOARD_STATS.resolutionRate}%` },
                { label: t('about.avgDaysToAssign'), value: `${DASHBOARD_STATS.avgTimeToAssign}` },
                { label: t('about.patentsFiled'), value: DASHBOARD_STATS.patentsFiled.toString() },
                { label: t('about.startupsSpawned'), value: DASHBOARD_STATS.startupsSpawned.toString() },
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
            <div className={styles.demoBadge}>{t('demo.badge')}</div>
            <h2 className={styles.demoTitle}>{t('demo.title')}</h2>
            <p className={styles.demoDesc}>{t('demo.desc')}</p>
            <div className={styles.demoRolesGrid}>
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  className={`${styles.demoRoleBtn} ${demoRole === r.role ? styles.demoRoleBtnActive : ''}`}
                  onClick={() => setDemoRole(r.role)}
                >
                  <span className={styles.demoRoleLabel}>{r.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.demoSelectedDesc}>
              {ROLES.find(r => r.role === demoRole)?.who}
            </div>
            <button className="btn btn-secondary btn-lg" style={{ marginTop: '1.5rem' }} onClick={handleDemoLogin}>
              {t('demo.enterAs')} {ROLES.find(r => r.role === demoRole)?.label} →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <img src="/srijan-logo.jpg" alt="SRIJAN Logo" width="28" height="28" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                <span>SRIJAN</span>
              </div>
              <p className={styles.footerTagline}>
                Societal Research, Innovation & Jharkhand Academic Network<br />
                {t('footer.deptName')}<br />
                {t('footer.govtName')}
              </p>
            </div>
            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>{t('footer.platform')}</h4>
              <Link href="/submit" className={styles.footerLink}>{t('footer.submitChallenge')}</Link>
              <Link href="/transparency" className={styles.footerLink}>{t('footer.dashboard')}</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>{t('footer.portals')}</h4>
              <Link href="/citizen" className={styles.footerLink}>{t('footer.citizenPortal')}</Link>
              <Link href="/university" className={styles.footerLink}>{t('footer.universityPortal')}</Link>
              <Link href="/industry" className={styles.footerLink}>{t('footer.industryPortal')}</Link>
              <Link href="/admin" className={styles.footerLink}>{t('footer.adminPortal')}</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4 className={styles.footerHeading}>{t('footer.legal')}</h4>
              <a href="#" className={styles.footerLink}>{t('footer.terms')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.privacy')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.accessibility')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.rti')}</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>{t('footer.copy1')}</p>
            <p className={styles.footerCopy}>{t('footer.copy2')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
