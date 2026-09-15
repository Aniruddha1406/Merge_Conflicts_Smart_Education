// src/app/submit/page.tsx
// Public submission page accessible without logging in

import SubmitChallenge from '../citizen/submit/page'
import Link from 'next/link'

export default function PublicSubmitPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="btn btn-ghost btn-sm">← Back to Portal Home</Link>
        <span className="text-xs text-secondary">Government of Jharkhand • Citizen Voice Portal</span>
      </div>
      <SubmitChallenge />
    </div>
  )
}
