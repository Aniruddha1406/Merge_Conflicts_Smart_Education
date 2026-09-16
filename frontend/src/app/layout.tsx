import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/authContext'
import { StoreProvider } from '@/lib/store'
import { LanguageProvider } from '@/i18n/LanguageContext'

export const metadata: Metadata = {
  title: {
    default: 'Societal Research, Innovation & Jharkhand Academic Network — Government of Jharkhand',
    template: '%s | SRIJAN',
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
    title: 'Societal Research, Innovation & Jharkhand Academic Network',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Ol+Chiki:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <StoreProvider>
              {children}
            </StoreProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
