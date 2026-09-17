'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useStore } from '@/lib/store'
import styles from './PortalLayout.module.css'

interface NavItem {
  label: string
  href: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface PortalLayoutProps {
  children: React.ReactNode
  navSections: NavSection[]
  portalLabel: string
}

export default function PortalLayout({ children, navSections, portalLabel }: PortalLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { state } = useStore()
  const unreadCount = state.notifications.filter(n => !n.read).length

  // Derive notification href from current portal
  const notifHref = pathname.startsWith('/admin') ? '/admin/notifications'
    : pathname.startsWith('/university') ? '/university/queue'
    : pathname.startsWith('/industry') ? '/industry/challenges'
    : '/citizen/my-submissions'

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarLogo}>
          <Link href="/" className={styles.logoMark} aria-label="Back to home">
            <img src="/srijan-logo.jpg" alt="SRIJAN Logo" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover' }} />
          </Link>
          <div>
            <div className={styles.logoTitle}>SRIJAN</div>
            <div className={styles.portalLabel}>{portalLabel}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section, si) => (
            <div key={si}>
              {section.title && (
                <div className="sidebar-nav-section">{section.title}</div>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {user && (
            <>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>{user.name[0]}</div>
                <div>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{(typeof user.institution === 'string' ? user.institution : (user.institution as any)?.name) ?? user.district ?? user.role}</div>
                </div>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <span className={styles.menuIcon} />
              <span className={styles.menuIcon} />
              <span className={styles.menuIcon} />
            </button>
          </div>
          <div className={styles.topbarRight}>
            {user && (
              <span className={styles.topbarUser}>
                Signed in as <strong>{user.name}</strong>
              </span>
            )}
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
