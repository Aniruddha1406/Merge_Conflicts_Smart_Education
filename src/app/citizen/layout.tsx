'use client'

import PortalLayout from '@/components/PortalLayout'

const NAV = [
  {
    items: [
      { label: 'Dashboard', href: '/citizen' },
      { label: 'Submit a Challenge', href: '/citizen/submit' },
      { label: 'My Submissions', href: '/citizen/my-submissions' },
      { label: 'Community Map', href: '/citizen/community' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/citizen/profile' },
    ],
  },
]

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout navSections={NAV} portalLabel="Citizen Portal">
      {children}
    </PortalLayout>
  )
}
