'use client'

import PortalLayout from '@/components/PortalLayout'

const NAV = [
  {
    items: [
      { label: 'Master Dashboard', href: '/admin' },
      { label: 'All Submissions', href: '/admin/submissions' },
      { label: 'AI Review Queue', href: '/admin/review' },
      { label: 'District Heatmap', href: '/admin/heatmap' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Institutions', href: '/admin/institutions' },
      { label: 'Industry Partners', href: '/admin/partners' },
      { label: 'Users & Roles', href: '/admin/users' },
      { label: 'Notifications', href: '/admin/notifications' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout navSections={NAV} portalLabel="Government Admin">
      {children}
    </PortalLayout>
  )
}
