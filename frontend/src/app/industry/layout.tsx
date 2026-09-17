'use client'

import PortalLayout from '@/components/PortalLayout'

const NAV = [
  {
    items: [
      { label: 'Dashboard', href: '/industry' },
      { label: 'Browse Challenges', href: '/industry/challenges' },
      { label: 'My Commitments', href: '/industry/commitments' },
    ],
  },
  {
    title: 'Partner',
    items: [
      { label: 'Partner Profile', href: '/industry/profile' },
    ],
  },
]

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout navSections={NAV} portalLabel="Industry Portal">
      {children}
    </PortalLayout>
  )
}
