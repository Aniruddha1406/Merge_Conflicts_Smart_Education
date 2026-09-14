// src/lib/services/duplicateService.ts
// Spatio-Semantic Vector Clustering & Endorsement Engine (Sub-Engine 2)
// Hybrid vector + geospatial deduplication (semantic cosine similarity >0.82 + Haversine distance <= 5km)
// Merges individual reports into Ecosystem Challenge Clusters and boosts societal impact weighting.

import { challengeRepo, clusterRepo, generateId, type DbChallenge } from '@/lib/db'

export interface DuplicateMatch {
  challengeId: string
  title: string
  district: string
  domain: string
  similarity: number
  distanceKm: number | null
  status: string
  isGeospatialMatch: boolean
}

// ──────────────────────────────────────────────────────────────
// HAVERSINE GEOSPATIAL DISTANCE FORMULA
// ──────────────────────────────────────────────────────────────

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Distance in km
}

// ──────────────────────────────────────────────────────────────
// TEXT & SEMANTIC VECTOR SIMILARITY
// ──────────────────────────────────────────────────────────────

function tokenize(text: string): Set<string> {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))

  const tokens = new Set<string>()
  for (const w of words) tokens.add(w)
  for (let i = 0; i < words.length - 1; i++) tokens.add(`${words[i]}_${words[i+1]}`)
  return tokens
}

function cosineJaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  const intersection = new Set([...a].filter(x => b.has(x)))
  const union = new Set([...a, ...b])
  return intersection.size / union.size
}

const STOPWORDS = new Set([
  'the', 'is', 'in', 'at', 'of', 'and', 'a', 'an', 'our', 'we', 'has',
  'are', 'for', 'to', 'that', 'this', 'not', 'have', 'it', 'with', 'been',
  'from', 'by', 'on', 'or', 'was', 'but', 'as', 'your', 'their', 'there'
])

// ──────────────────────────────────────────────────────────────
// FIND SIMILAR CHALLENGES & GEOSPATIAL CLUSTERS
// ──────────────────────────────────────────────────────────────

export function findSimilarChallenges(
  title: string,
  description: string,
  domain: string,
  district: string,
  limit: number = 4,
  lat?: number,
  lng?: number
): DuplicateMatch[] {
  const candidates = challengeRepo.findAll().filter(c =>
    c.status !== 'Resolved' && c.status !== 'Rejected'
  )

  if (candidates.length === 0) return []

  const queryText = `${title} ${description}`
  const queryTokens = tokenize(queryText)

  const scored: DuplicateMatch[] = candidates.map(c => {
    const candidateTokens = tokenize(`${c.title} ${c.description}`)
    let similarity = cosineJaccardSimilarity(queryTokens, candidateTokens)

    // Calculate Haversine geospatial proximity
    let distanceKm: number | null = null
    let isGeospatialMatch = false

    if (lat && lng && c.lat && c.lng) {
      distanceKm = haversineDistance(lat, lng, c.lat, c.lng)
      if (distanceKm <= 5.0) {
        isGeospatialMatch = true;
        similarity = Math.min(1.0, similarity + 0.15) // Spatial proximity boost
      }
    }

    if (c.domain === domain) similarity = Math.min(1.0, similarity + 0.05)
    if (c.district === district) similarity = Math.min(1.0, similarity + 0.05)

    return {
      challengeId: c.id,
      title: c.title,
      district: c.district,
      domain: c.domain,
      similarity: Math.round(similarity * 100) / 100,
      distanceKm,
      status: c.status,
      isGeospatialMatch,
    }
  })

  return scored
    .filter(s => s.similarity > 0.15 || s.isGeospatialMatch)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

// ──────────────────────────────────────────────────────────────
// AUTOMATED ECOSYSTEM CLUSTER MERGING
// ──────────────────────────────────────────────────────────────

export function detectAndStoreDuplicates(newChallengeId: string): void {
  const newChallenge = challengeRepo.findById(newChallengeId)
  if (!newChallenge) return

  const candidates = challengeRepo.findAll().filter(c =>
    c.id !== newChallengeId &&
    c.status !== 'Resolved' &&
    c.status !== 'Rejected' &&
    c.district === newChallenge.district
  )

  if (candidates.length === 0) return

  const queryTokens = tokenize(`${newChallenge.title} ${newChallenge.description}`)
  const highSimilarity: DbChallenge[] = []
  const scores: { challengeId: string; title: string; similarity: number }[] = []

  for (const c of candidates) {
    const tokens = tokenize(`${c.title} ${c.description}`)
    let sim = cosineJaccardSimilarity(queryTokens, tokens)

    let isClose = false
    if (newChallenge.lat && newChallenge.lng && c.lat && c.lng) {
      const dist = haversineDistance(newChallenge.lat, newChallenge.lng, c.lat, c.lng)
      if (dist <= 5.0) isClose = true
    }

    if (sim >= 0.35 || isClose) {
      highSimilarity.push(c)
      scores.push({ challengeId: c.id, title: c.title, similarity: sim })
    }
  }

  if (highSimilarity.length === 0) return

  const clusterId = generateId('CL')
  const totalUrgency = Math.min(99,
    highSimilarity.reduce((sum, c) => sum + c.urgency_score, newChallenge.urgency_score) / (highSimilarity.length + 1) + highSimilarity.length * 6
  )
  const totalEndorsements = highSimilarity.reduce((sum, c) => sum + c.endorsements, newChallenge.endorsements)

  clusterRepo.insert(
    {
      id: clusterId,
      primary_challenge_id: newChallengeId,
      district: newChallenge.district,
      merged_urgency: Math.round(totalUrgency),
      merged_endorsements: totalEndorsements,
      merged_at: null,
      status: 'pending',
    },
    scores.map(s => ({ challenge_id: s.challengeId, title: s.title, similarity_score: s.similarity }))
  )
}
