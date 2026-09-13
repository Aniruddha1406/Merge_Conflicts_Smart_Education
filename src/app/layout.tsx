import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/authContext'
import { StoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: {
    default: 'Societal Innovation Collaboration Portal — Government of Jharkhand',
    template: '%s | SICP Jharkhand',
  },
  description:
    'A platform that crowdsources local societal challenges from citizens and routes them to Higher Education Institutions and industry partners for collaborative research, innovation, and deployment.',
  keywords: [
    'Jharkhand',
    'innovation',
    'societal challenges',
    'NEP 2020',
    'higher education',
    'citizen engagement',
    'CSR',
  ],
  authors: [{ name: 'Government of Jharkhand' }],
  creator: 'Department of Higher and Technical Education, Jharkhand',
  metadataBase: new URL('https://sicp.jharkhand.gov.in'),
  openGraph: {
    title: 'Societal Innovation Collaboration Portal',
    description:
      'Bridging citizens, universities, and industry to solve Jharkhand\'s societal challenges.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3B2A22" />
      </head>
      <body><AuthProvider><StoreProvider>{children}</StoreProvider></AuthProvider></body>
    </html>
  )
}
