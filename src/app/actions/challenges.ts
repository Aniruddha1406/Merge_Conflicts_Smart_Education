'use server'

// src/app/actions/challenges.ts
// Server Actions for challenge lifecycle management.
// All state mutations go through here — never from client-side mock store.

import { revalidatePath } from 'next/cache'
import { challengeRepo, generateId, generateChallengeId, evidenceRepo, now, getDashboardStats, userRepo } from '@/lib/db'
import { classifyChallenge } from '@/lib/services/aiService'
import { detectAndStoreDuplicates, findSimilarChallenges } from '@/lib/services/duplicateService'
import { generateRoutingRecommendations, getStoredRecommendations } from '@/lib/services/routingService'
import {
  notifyChallengeSubmitted,
  notifyChallengeValidated,
  notifyChallengeAssigned,
  notifyVerificationRequested,
  notifyChallengeResolved,
} from '@/lib/services/notificationService'

// ──────────────────────────────────────────────────────────────
// SUBMIT CHALLENGE
// ──────────────────────────────────────────────────────────────

export async function previewSubmission(text: string, language: string = 'en') {
  const classification = await classifyChallenge(text, language)
  const similar = findSimilarChallenges(text, text, classification.recommendedDomain, '', 4)
  return { classification, similar }
}

export interface SubmitChallengeInput {
  title: string
  description: string
  domain: string
  district: string
  block?: string
  village?: string
  reporterType?: string
  lat?: number
  lng?: number
  submittedById: string
  submittedByName: string
  language?: string
  /** IDs of already-uploaded evidence files (via /api/upload) */
  fileIds?: string[]
}

export interface SubmitChallengeResult {
  success: boolean
  challengeId?: string
  error?: string
  classification?: {
    category: string
    subcategory: string
    priority: string
    urgencyScore: number
    keywords: string[]
    problemStatement: string
  }
}

export async function submitChallenge(input: SubmitChallengeInput): Promise<SubmitChallengeResult> {
  try {
    await (await import('@/lib/db/init')).initDatabase()

    // 1. AI classification
    const classification = await classifyChallenge(
      `${input.title} ${input.description}`,
      input.language || 'en'
    )

    // 2. Ensure valid user reference in SQLite
    let validUserId = input.submittedById
    const existingUser = userRepo.findById(validUserId)
    if (!existingUser) {
      const defaultCitizen = userRepo.findByRole('citizen')[0]
      validUserId = defaultCitizen?.id || 'U-CITIZEN-001'
    }

    // 3. Generate human-readable sequential ID
    const challengeId = generateChallengeId()

    // 4. Persist with full AI metadata
    challengeRepo.insert({
      id: challengeId,
      title: input.title,
      description: input.description,
      domain: input.domain || classification.recommendedDomain,
      district: input.district,
      block: input.block || null,
      village: input.village || null,
      reporter_type: input.reporterType || 'citizen',
      submitted_by_id: validUserId,
      submitted_by_name: input.submittedByName || 'Citizen User',
      submitted_at: now(),
      status: 'Submitted',
      endorsements: 0,
      urgency_score: classification.urgencyScore,
      similar_count: 0,
      lat: input.lat || null,
      lng: input.lng || null,
      ai_category: classification.category,
      ai_subcategory: classification.subcategory,
      ai_priority: classification.priority,
      ai_keywords: classification.keywords.join(','),
      ai_technical_core: classification.technicalCore,
      ai_academic_field: classification.targetAcademicField,
      ai_confidence: classification.confidence,
      ai_triage: classification.triageType,
      flagged: 0,
    })

    // 4b. Link any uploaded evidence files to this challenge
    if (input.fileIds?.length) {
      for (const fid of input.fileIds) {
        try {
          const db = (await import('@/lib/db')).getDb()
          db.prepare('UPDATE challenge_evidence SET challenge_id = ? WHERE id = ?').run(challengeId, fid)
        } catch {}
      }
    }

    // 4. Duplicate detection (non-blocking)
    try { detectAndStoreDuplicates(challengeId) } catch {}

    // 5. Generate initial routing recommendations (non-blocking)
    try {
      generateRoutingRecommendations(
        challengeId,
        input.domain || classification.recommendedDomain,
        classification.keywords,
        classification.urgencyScore
      )
    } catch {}

    // 6. Notifications
    try {
      const admins = userRepo.findByRole('government').concat(userRepo.findByRole('superadmin'))
      const adminIds = admins.map(a => a.id)
      notifyChallengeSubmitted(input.submittedById, challengeId, input.title, adminIds)
    } catch {}

    revalidatePath('/citizen')
    revalidatePath('/citizen/my-submissions')
    revalidatePath('/admin')
    revalidatePath('/admin/submissions')

    return {
      success: true,
      challengeId,
      classification: {
        category: classification.category,
        subcategory: classification.subcategory,
        priority: classification.priority,
        urgencyScore: classification.urgencyScore,
        keywords: classification.keywords,
        problemStatement: classification.problemStatement,
      },
    }
  } catch (err) {
    console.error('[submitChallenge]', err)
    return { success: false, error: 'Failed to submit challenge. Please try again.' }
  }
}

// ──────────────────────────────────────────────────────────────
// CLASSIFY TEXT (for preview before submission)
// ──────────────────────────────────────────────────────────────

export async function classifyText(text: string, language: string = 'en') {
  try {
    return await classifyChallenge(text, language)
  } catch {
    return null
  }
}

// ──────────────────────────────────────────────────────────────
// FIND SIMILAR (citizen preview)
// ──────────────────────────────────────────────────────────────

export async function getSimilarChallenges(
  title: string,
  description: string,
  domain: string,
  district: string
) {
  return findSimilarChallenges(title, description, domain, district, 3)
}

// ──────────────────────────────────────────────────────────────
// ENDORSE CHALLENGE
// ──────────────────────────────────────────────────────────────

export async function endorseChallenge(challengeId: string, userId: string): Promise<boolean> {
  const ok = challengeRepo.endorse(challengeId, userId)
  if (ok) {
    revalidatePath('/citizen')
    revalidatePath('/citizen/community')
  }
  return ok
}

// ──────────────────────────────────────────────────────────────
// ADMIN ACTIONS
// ──────────────────────────────────────────────────────────────

export async function validateChallenge(
  challengeId: string,
  adminId: string,
  adminName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const challenge = challengeRepo.findById(challengeId)
    if (!challenge) return { success: false, error: 'Challenge not found' }

    challengeRepo.updateStatus(challengeId, 'Validated', {
      validated_at: now(),
      validated_by: adminName,
    })

    // Generate routing recommendations on validate
    try {
      generateRoutingRecommendations(
        challengeId,
        challenge.domain,
        (challenge.ai_keywords || '').split(',').filter(Boolean),
        challenge.urgency_score
      )
    } catch {}

    // Notify citizen
    try { notifyChallengeValidated(challenge.submitted_by_id, challengeId, challenge.title) } catch {}

    revalidatePath('/admin')
    revalidatePath('/admin/submissions')
    revalidatePath('/citizen/my-submissions')
    return { success: true }
  } catch (err) {
    console.error('[validateChallenge]', err)
    return { success: false, error: 'Validation failed' }
  }
}

export async function rejectChallenge(
  challengeId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    challengeRepo.updateStatus(challengeId, 'Rejected', {
      rejected_at: now(),
      rejection_reason: reason,
    })
    revalidatePath('/admin/submissions')
    return { success: true }
  } catch {
    return { success: false, error: 'Rejection failed' }
  }
}

export async function flagChallenge(challengeId: string, reason: string): Promise<void> {
  challengeRepo.flag(challengeId, reason)
  revalidatePath('/admin/submissions')
}

export async function assignChallenge(
  challengeId: string,
  institutionId: string,
  institutionName: string,
  fitScore: number,
  adminId: string,
  adminName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const challenge = challengeRepo.findById(challengeId)
    if (!challenge) return { success: false, error: 'Challenge not found' }

    challengeRepo.assign(challengeId, institutionId, institutionName, fitScore)

    // Notify citizen + university admin
    try {
      const univAdmins = userRepo.findByRole('university')
      const adminForInst = univAdmins.find(u => u.institution_id === institutionId)
      notifyChallengeAssigned(
        challenge.submitted_by_id,
        challengeId,
        challenge.title,
        institutionName,
        adminForInst?.id || 'U-001'
      )
    } catch {}

    revalidatePath('/admin')
    revalidatePath('/admin/submissions')
    revalidatePath('/university')
    revalidatePath('/citizen/my-submissions')
    return { success: true }
  } catch (err) {
    console.error('[assignChallenge]', err)
    return { success: false, error: 'Assignment failed' }
  }
}

// ──────────────────────────────────────────────────────────────
// GET ROUTING RECOMMENDATIONS FOR CHALLENGE
// ──────────────────────────────────────────────────────────────

export async function getRoutingRecommendations(challengeId: string) {
  const stored = getStoredRecommendations(challengeId)
  if (stored.length > 0) return stored

  // Generate fresh if not stored
  const challenge = challengeRepo.findById(challengeId)
  if (!challenge) return []
  return generateRoutingRecommendations(
    challengeId,
    challenge.domain,
    (challenge.ai_keywords || '').split(',').filter(Boolean),
    challenge.urgency_score
  )
}

// ──────────────────────────────────────────────────────────────
// VERIFICATION
// ──────────────────────────────────────────────────────────────

export async function submitVerification(
  challengeId: string,
  userId: string,
  data: { comments?: string; lat?: number; lng?: number; photoUrl?: string }
): Promise<{ success: boolean; fraudRiskScore?: number; error?: string }> {
  try {
    const challenge = challengeRepo.findById(challengeId)
    if (!challenge) return { success: false, error: 'Challenge not found' }

    const { verifyProofOfImpact } = await import('@/lib/services/verificationService')
    const check = verifyProofOfImpact(
      challenge.lat ?? null,
      challenge.lng ?? null,
      data.lat,
      data.lng,
      new Date().toISOString(),
      'https://sicp.jharkhand.gov.in/baseline.jpg',
      data.photoUrl || 'https://sicp.jharkhand.gov.in/post_deploy.jpg'
    )

    if (!check.passed) {
      return { success: false, fraudRiskScore: check.fraudRiskScore, error: check.reason }
    }

    const { verificationRepo, now, generateId, getDb } = await import('@/lib/db')
    const db = getDb()

    let req = verificationRepo.findForChallenge(challengeId)
    let requestId = req?.id || null

    if (!requestId) {
      requestId = generateId('VR')
      db.prepare(`
        INSERT INTO verification_requests (id, challenge_id, project_id, deadline, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(requestId, challengeId, null, null, 'submitted')
    } else {
      db.prepare('UPDATE verification_requests SET status = ? WHERE id = ?').run('submitted', requestId)
    }

    // Record verification evidence
    const evidenceId = generateId('VE')
    db.prepare(`
      INSERT INTO verification_evidence (id, request_id, submitted_by_id, submitted_at, photo_url, lat, lng, confirmed_by_reporter, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(evidenceId, requestId, userId, now(), data?.photoUrl || null, data?.lat || null, data?.lng || null, data?.comments || null)

    challengeRepo.updateStatus(challengeId, 'Pending Verification')

    try { notifyVerificationRequested(challenge.submitted_by_id, challengeId, challenge.title) } catch {}

    revalidatePath('/citizen/my-submissions')
    revalidatePath('/admin')
    revalidatePath('/transparency')
    return { success: true, fraudRiskScore: check.fraudRiskScore }
  } catch (err) {
    console.error('[submitVerification]', err)
    return { success: false, error: 'Verification submission failed' }
  }
}

export async function approveVerification(
  challengeId: string,
  adminName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { verificationRepo } = await import('@/lib/db')
    const req = verificationRepo.findForChallenge(challengeId)
    if (req) verificationRepo.approve(req.id, adminName)
    challengeRepo.updateStatus(challengeId, 'Resolved')

    const challenge = challengeRepo.findById(challengeId)
    const admins = userRepo.findByRole('government')
    if (challenge) {
      try { notifyChallengeResolved(challenge.submitted_by_id, challengeId, challenge.title, admins[0]?.id || 'G-001') } catch {}
    }

    revalidatePath('/admin')
    revalidatePath('/citizen/my-submissions')
    return { success: true }
  } catch {
    return { success: false, error: 'Approval failed' }
  }
}

// ──────────────────────────────────────────────────────────────
// DATA GETTERS (replacing mock store reads)
// ──────────────────────────────────────────────────────────────

export async function getAllChallenges() {
  return challengeRepo.findAll()
}

export async function getChallengeById(id: string) {
  return challengeRepo.findById(id)
}

export async function getChallengesByUser(userId: string) {
  return challengeRepo.findByUser(userId)
}

export async function getDashboardData() {
  return getDashboardStats()
}

/** Get all challenges assigned to a specific institution */
export async function getChallengesByInstitution(institutionId: string) {
  const { getDb } = await import('@/lib/db')
  const db = getDb()
  return db.prepare(`
    SELECT * FROM challenges
    WHERE assigned_institution_id = ?
    ORDER BY submitted_at DESC
  `).all(institutionId) as any[]
}

/** Get assigned + validated challenges available for university */
export async function getAssignableChallenges(institutionId: string) {
  const { getDb } = await import('@/lib/db')
  const db = getDb()
  return db.prepare(`
    SELECT * FROM challenges
    WHERE (assigned_institution_id = ? AND status IN ('Assigned to Institution','In Progress'))
       OR (status = 'Validated')
    ORDER BY urgency_score DESC, submitted_at DESC
  `).all(institutionId) as any[]
}

/** Get validated INNOVATION_CHALLENGE challenges that need institution assignment */
export async function getValidatedChallengesForAllocation() {
  const { getDb } = await import('@/lib/db')
  const db = getDb()
  return db.prepare(`
    SELECT * FROM challenges
    WHERE status = 'Validated'
    ORDER BY urgency_score DESC, submitted_at DESC
  `).all() as any[]
}

/** Generate routing recommendations for a challenge */
export async function generateRoutingForChallenge(
  challengeId: string,
  domain: string,
  keywords: string[],
  urgencyScore: number,
  district: string
) {
  const { generateRoutingRecommendations } = await import('@/lib/services/routingService')
  return generateRoutingRecommendations(challengeId, domain, keywords, urgencyScore, district)
}


/** Get stored routing recommendations for a challenge */
export async function getRoutingRecommendationsForChallenge(challengeId: string) {
  const { routingRepo, institutionRepo } = await import('@/lib/db')
  const recs = routingRepo.findForChallenge(challengeId)
  if (recs.length === 0) return []
  const institutions = institutionRepo.findAll()
  return recs.map(r => {
    const inst = institutions.find(i => i.id === r.institution_id)
    return {
      institutionId: r.institution_id,
      institutionName: r.institution_name,
      fitScore: r.fit_score,
      matchBasis: r.match_basis.split(',').filter(Boolean),
      location: inst?.location || '',
      departments: inst?.departments || [],
    }
  })
}

/** Assign a challenge to an institution */
export async function assignChallenge(
  challengeId: string,
  institutionId: string,
  institutionName: string,
  fitScore: number,
  adminId: string = 'G-001',
  adminName: string = 'Government Admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    challengeRepo.assign(challengeId, institutionId, institutionName, fitScore)

    // Audit log
    const { getDb, generateId, now: dbNow } = await import('@/lib/db')
    getDb().prepare(`
      INSERT INTO audit_log (id, user_id, user_name, action, entity_type, entity_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(generateId('AL'), adminId, adminName, 'ASSIGN_INSTITUTION', 'challenge', challengeId,
      JSON.stringify({ institutionId, institutionName, fitScore }), dbNow())

    // Notify university users for this institution
    try {
      const uniUsers = userRepo.findByRole('university')
      const instUsers = uniUsers.filter(u => u.institution_id === institutionId)
      const challenge = challengeRepo.findById(challengeId)
      if (challenge) {
        const uniAdminId = instUsers[0]?.id || institutionId
        notifyChallengeAssigned(
          challenge.submitted_by_id,
          challengeId,
          challenge.title,
          institutionName,
          uniAdminId
        )
      }
    } catch {}

    revalidatePath('/admin/allocation')
    revalidatePath('/admin/submissions')
    revalidatePath('/university/queue')
    revalidatePath('/university')
    return { success: true }
  } catch (err) {
    console.error('[assignChallenge]', err)
    return { success: false, error: String(err) }
  }
}
