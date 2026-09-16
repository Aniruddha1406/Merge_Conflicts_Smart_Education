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
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 20 C10 14 16 12 16 16 C16 20 22 18 22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="10" cy="21" r="2" fill="currentColor"/>
              <circle cx="22" cy="11" r="2" fill="currentColor"/>
            </svg>
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
            {unreadCount > 0 && (
              <Link href={notifHref} className={styles.notifBell} aria-label={`${unreadCount} unread notifications`}>
                <span className={styles.notifIcon}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z"/>
                    <path d="M8.5 17a1.5 1.5 0 0 0 3 0"/>
                  </svg>
                </span>
                <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              </Link>
            )}
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
