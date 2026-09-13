'use client'

import PortalLayout from '@/components/PortalLayout'

const NAV = [
  {
    items: [
      { label: 'Dashboard', href: '/university' },
      { label: 'Challenge Queue', href: '/university/queue' },
      { label: 'Active Projects', href: '/university/projects' },
      { label: 'Team Formation', href: '/university/teams' },
    ],
  },
  {
    title: 'NEP 2020',
    items: [
      { label: 'ABC Compliance', href: '/university/abc' },
    ],
  },
  {
    title: 'Institution',
    items: [
      { label: 'Institution Profile', href: '/university/profile' },
    ],
  },
]

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout navSections={NAV} portalLabel="University Portal">
      {children}
    </PortalLayout>
  )
}
