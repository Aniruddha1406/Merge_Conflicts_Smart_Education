// src/lib/services/routingService.ts
// Two-Sided Capability-to-Challenge Routing Engine (Sub-Engine 3)
// Multi-Factor Institutional Fit Score (0-100%):
//   - Disciplinary Alignment (50%)
//   - Geographic Proximity (30%)
//   - Institutional Bandwidth (20%)

import { institutionRepo, routingRepo, generateId, now, type DbInstitution } from '@/lib/db'

export interface RoutingRecommendation {
  institutionId: string
  institutionName: string
  shortName: string
  location: string
  fitScore: number // 0 to 1
  matchBasis: string[]
  incubationCenter: boolean
  department?: string
  breakdown: {
    disciplinaryAlignmentPct: number
    geographicProximityPct: number
    bandwidthPct: number
  }
  reasons: string[]
}

const DOMAIN_EXPERTISE_MAP: Record<string, string[]> = {
  'Water':          ['Water Technology', 'Environmental Engineering', 'Civil Engineering', 'Water Sanitation', 'Hydrology'],
  'Health':         ['Biotechnology', 'Life Sciences', 'Pharmaceuticals', 'Medical Technology', 'Public Health'],
  'Agriculture':    ['Agricultural Engineering', 'Agri-Tech', 'Agriculture', 'Soil Science', 'Remote Sensing'],
  'Education':      ['Computer Science', 'AI/ML', 'EdTech', 'Educational Technology', 'Digital Literacy'],
  'Infrastructure': ['Civil Engineering', 'Urban Planning', 'Structural Engineering', 'Smart Infrastructure'],
  'Environment':    ['Environmental Engineering', 'Climate Action', 'Renewable Energy', 'Pollution Control'],
  'Livelihood':     ['Social Innovation', 'Rural Development', 'Entrepreneurship', 'Livelihood', 'Finance'],
  'Governance':     ['E-Governance', 'Public Policy', 'Data Analytics', 'Digital Government', 'AI/ML'],
}

const DEPARTMENT_SPECIALTY: Record<string, string[]> = {
  'Water':          ['Civil Engineering', 'Environmental Engineering', 'Chemical Engineering'],
  'Health':         ['Biotechnology', 'Chemistry', 'Life Sciences', 'Electronics'],
  'Agriculture':    ['Agricultural Engineering', 'Chemistry', 'Remote Sensing & GIS'],
  'Education':      ['Computer Science', 'Information Technology'],
  'Infrastructure': ['Civil Engineering', 'Electrical Engineering', 'Architecture'],
  'Environment':    ['Environmental Engineering', 'Chemical Engineering', 'Geography'],
  'Livelihood':     ['Management Studies', 'Economics', 'Social Work'],
  'Governance':     ['Computer Science', 'Information Technology', 'Management Studies'],
}

// District -> Institution proximity matrix (0 to 1)
const GEOGRAPHIC_PROXIMITY_MATRIX: Record<string, Record<string, number>> = {
  'Ranchi':          { 'BIT Mesra': 0.95, 'RIMS Ranchi': 0.98, 'NIT Jamshedpur': 0.70, 'IIT ISM Dhanbad': 0.65 },
  'Dhanbad':         { 'IIT ISM Dhanbad': 0.98, 'BIT Mesra': 0.65, 'NIT Jamshedpur': 0.70, 'RIMS Ranchi': 0.60 },
  'East Singhbhum':  { 'NIT Jamshedpur': 0.98, 'BIT Mesra': 0.70, 'IIT ISM Dhanbad': 0.65, 'RIMS Ranchi': 0.65 },
  'Jamshedpur':      { 'NIT Jamshedpur': 0.98, 'BIT Mesra': 0.70, 'IIT ISM Dhanbad': 0.65, 'RIMS Ranchi': 0.65 },
  'Ramgarh':         { 'BIT Mesra': 0.90, 'RIMS Ranchi': 0.85, 'IIT ISM Dhanbad': 0.75, 'NIT Jamshedpur': 0.65 },
  'Hazaribagh':      { 'BIT Mesra': 0.85, 'IIT ISM Dhanbad': 0.80, 'RIMS Ranchi': 0.80, 'NIT Jamshedpur': 0.60 },
  'Latehar':         { 'BIT Mesra': 0.82, 'RIMS Ranchi': 0.80, 'NIT Jamshedpur': 0.55, 'IIT ISM Dhanbad': 0.50 },
  'Gumla':           { 'BIT Mesra': 0.80, 'RIMS Ranchi': 0.82, 'NIT Jamshedpur': 0.60, 'IIT ISM Dhanbad': 0.45 },
}

export function generateRoutingRecommendations(
  challengeId: string,
  domain: string,
  keywords: string[],
  urgencyScore: number,
  district?: string
): RoutingRecommendation[] {
  const institutions = institutionRepo.findAll()
  const targetExpertise = DOMAIN_EXPERTISE_MAP[domain] || []
  const targetDepts = DEPARTMENT_SPECIALTY[domain] || []

  const scored: RoutingRecommendation[] = institutions.map(inst => {
    const expertise = inst.expertise || []
    const departments = inst.departments || []
    const matchBasis: string[] = []
    const reasons: string[] = []

    // 1. Disciplinary Alignment (50% Weight)
    let disciplinaryScore = 0.4 // base
    for (const tag of expertise) {
      if (targetExpertise.some(t => tag.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(tag.toLowerCase()))) {
        disciplinaryScore += 0.25
        if (!matchBasis.includes(tag)) matchBasis.push(tag)
      }
    }
    for (const dept of departments) {
      if (targetDepts.some(d => dept.toLowerCase().includes(d.toLowerCase()))) {
        disciplinaryScore += 0.20
        const shortDept = dept.split(' ').slice(0, 2).join(' ')
        if (!matchBasis.includes(shortDept)) matchBasis.push(shortDept)
      }
    }
    disciplinaryScore = Math.min(1.0, disciplinaryScore)
    reasons.push(`Disciplinary match in ${matchBasis.slice(0, 2).join(' & ')}`)

    // 2. Geographic Proximity (30% Weight)
    const distName = district || 'Ranchi'
    const proximityScore = (GEOGRAPHIC_PROXIMITY_MATRIX[distName]?.[inst.short_name] || 0.70)
    reasons.push(`${Math.round(proximityScore * 100)}% spatial proximity to ${distName} district`)

    // 3. Institutional Bandwidth (20% Weight)
    const bandwidthScore = inst.incubation_center ? 0.95 : 0.80
    if (inst.incubation_center) {
      matchBasis.push('Incubation Centre')
      reasons.push('Active Incubation Centre & CoE Lab')
    }

    // Weighted Combined Fit Score: 50% Disc + 30% Geo + 20% Bandwidth
    const finalScore = Math.min(0.98, (disciplinaryScore * 0.50) + (proximityScore * 0.30) + (bandwidthScore * 0.20))

    return {
      institutionId: inst.id,
      institutionName: inst.name,
      shortName: inst.short_name,
      location: inst.location,
      fitScore: Math.round(finalScore * 100) / 100,
      matchBasis: matchBasis.slice(0, 4),
      incubationCenter: inst.incubation_center === 1,
      breakdown: {
        disciplinaryAlignmentPct: Math.round(disciplinaryScore * 100),
        geographicProximityPct: Math.round(proximityScore * 100),
        bandwidthPct: Math.round(bandwidthScore * 100),
      },
      reasons: reasons.slice(0, 3),
    }
  })

  const ranked = scored
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3)

  // Store in database
  routingRepo.upsert(ranked.map(r => ({
    id: generateId('RR'),
    challenge_id: challengeId,
    institution_id: r.institutionId,
    institution_name: r.shortName,
    fit_score: r.fitScore,
    match_basis: r.matchBasis.join(','),
    generated_at: now(),
  })))

  return ranked
}

export function getStoredRecommendations(challengeId: string): RoutingRecommendation[] {
  const recs = routingRepo.findForChallenge(challengeId)
  return recs.map(r => ({
    institutionId: r.institution_id,
    institutionName: r.institution_name,
    shortName: r.institution_name,
    location: '',
    fitScore: r.fit_score,
    matchBasis: r.match_basis.split(',').filter(Boolean),
    incubationCenter: false,
    breakdown: {
      disciplinaryAlignmentPct: Math.round(r.fit_score * 100),
      geographicProximityPct: 85,
      bandwidthPct: 90,
    },
    reasons: [`Matched ${r.institution_name} with ${Math.round(r.fit_score * 100)}% fit score`],
  }))
}
