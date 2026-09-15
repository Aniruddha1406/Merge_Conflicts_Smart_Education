'use server'

// src/app/actions/projects.ts
// Server Actions for project/milestone lifecycle.

import { revalidatePath } from 'next/cache'
import { projectRepo, generateId, now, challengeRepo } from '@/lib/db'
import { notifyMilestoneComplete } from '@/lib/services/notificationService'

// ──────────────────────────────────────────────────────────────
// CREATE PROJECT FROM CHALLENGE
// ──────────────────────────────────────────────────────────────

export async function createProject(input: {
  challengeId: string
  title: string
  institutionId: string
  institutionName: string
  industryPartnerId?: string
  industryPartnerName?: string
  targetDate: string
  team: { name: string; role: string; department?: string; creditHours?: number }[]
  milestones: { title: string; description: string; dueDate: string; studentHours: number; deliverables?: string[] }[]
}): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const projectId = generateId('PRJ')
    const project = {
      id: projectId,
      challenge_id: input.challengeId,
      title: input.title,
      institution_id: input.institutionId,
      institution_name: input.institutionName,
      industry_partner_id: input.industryPartnerId || null,
      industry_partner_name: input.industryPartnerName || null,
      status: 'Planning',
      start_date: now().split('T')[0],
      target_date: input.targetDate,
      created_at: now(),
      updated_at: now(),
    }

    projectRepo.insert(
      project,
      input.team.map(m => ({
        user_id: null,
        name: m.name,
        role: m.role,
        department: m.department || null,
        credit_hours: m.creditHours || 0,
      })),
      input.milestones.map(ms => ({
        title: ms.title,
        description: ms.description,
        due_date: ms.dueDate,
        completed: 0,
        faculty_approved: 0,
        student_hours: ms.studentHours,
        deliverables: ms.deliverables,
      }))
    )

    // Update challenge status to In Progress
    challengeRepo.updateStatus(input.challengeId, 'In Progress')

    revalidatePath('/university')
    revalidatePath('/university/projects')
    revalidatePath('/admin')
    return { success: true, projectId }
  } catch (err) {
    console.error('[createProject]', err)
    return { success: false, error: 'Failed to create project' }
  }
}

// ──────────────────────────────────────────────────────────────
// ACCEPT/DECLINE CHALLENGE (University)
// ──────────────────────────────────────────────────────────────

export async function acceptChallenge(
  challengeId: string,
  institutionId: string,
  institutionName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Move challenge to In Progress — project will be created separately
    challengeRepo.updateStatus(challengeId, 'In Progress')
    revalidatePath('/university')
    revalidatePath('/university/queue')
    revalidatePath('/admin/submissions')
    return { success: true }
  } catch {
    return { success: false, error: 'Acceptance failed' }
  }
}

export async function declineChallenge(
  challengeId: string,
  institutionId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark as Validated again (back to assignment queue) with a flag note
    challengeRepo.updateStatus(challengeId, 'Validated', {
      flag_reason: `Declined by institution: ${reason}`,
    })
    // Clear institution assignment so admin can reassign
    const db = (await import('@/lib/db')).getDb()
    db.prepare(`
      UPDATE challenges SET
        assigned_institution_id = NULL,
        assigned_institution_name = NULL,
        fit_score = NULL,
        status = 'Validated',
        updated_at = ?
      WHERE id = ?
    `).run(now(), challengeId)

    revalidatePath('/university/queue')
    revalidatePath('/admin/submissions')
    return { success: true }
  } catch (err) {
    console.error('[declineChallenge]', err)
    return { success: false, error: 'Decline failed' }
  }
}

// ──────────────────────────────────────────────────────────────
// MILESTONE ACTIONS
// ──────────────────────────────────────────────────────────────

export async function completeMilestone(
  projectId: string,
  milestoneId: string,
  rubricScore: number,
  studentHours: number,
  facultyName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    projectRepo.completeMilestone(milestoneId, rubricScore, studentHours)

    // Check if all milestones complete → move project to Testing
    const project = projectRepo.findById(projectId)
    if (project) {
      const allDone = project.milestones.every(m => m.completed || m.id === milestoneId)
      if (allDone) {
        projectRepo.updateStatus(projectId, 'Testing')
        // Create verification request
        const { verificationRepo } = await import('@/lib/db')
        verificationRepo.create(project.challenge_id, projectId)
        // Notify citizen
        const challenge = challengeRepo.findById(project.challenge_id)
        if (challenge) {
          const { notifyVerificationRequested } = await import('@/lib/services/notificationService')
          try { notifyVerificationRequested(challenge.submitted_by_id, project.challenge_id, challenge.title) } catch {}
        }
      }
    }

    revalidatePath(`/university/projects/${projectId}`)
    revalidatePath('/university')
    revalidatePath('/university/abc')
    return { success: true }
  } catch (err) {
    console.error('[completeMilestone]', err)
    return { success: false, error: 'Failed to complete milestone' }
  }
}

export async function approveMilestone(
  milestoneId: string,
  projectId: string,
  facultyName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    projectRepo.approveMilestone(milestoneId, facultyName)
    revalidatePath(`/university/projects/${projectId}`)
    revalidatePath('/university/abc')
    return { success: true }
  } catch {
    return { success: false, error: 'Approval failed' }
  }
}

export async function addMilestone(
  projectId: string,
  ms: { title: string; description: string; dueDate: string; studentHours: number; deliverables?: string[] }
): Promise<{ success: boolean; milestoneId?: string; error?: string }> {
  try {
    const id = projectRepo.addMilestone(projectId, {
      title: ms.title,
      description: ms.description,
      due_date: ms.dueDate,
      student_hours: ms.studentHours,
      deliverables: ms.deliverables,
    })
    revalidatePath(`/university/projects/${projectId}`)
    return { success: true, milestoneId: id }
  } catch {
    return { success: false, error: 'Failed to add milestone' }
  }
}

// ──────────────────────────────────────────────────────────────
// DATA GETTERS
// ──────────────────────────────────────────────────────────────

export async function getAllProjects() {
  const { getDb } = await import('@/lib/db')
  const db = getDb()

  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as any[]

  return projects.map((p: any) => {
    const milestones = db.prepare('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC').all(p.id) as any[]
    const team = db.prepare('SELECT * FROM project_members WHERE project_id = ?').all(p.id) as any[]
    return { ...p, milestones, team }
  })
}

export async function getProjectById(id: string) {
  return projectRepo.findById(id)
}

export async function getProjectsByInstitution(institutionId: string) {
  const { getDb } = await import('@/lib/db')
  const db = getDb()

  const projects = db.prepare('SELECT * FROM projects WHERE institution_id = ? ORDER BY created_at DESC').all(institutionId) as any[]

  return projects.map((p: any) => {
    const milestones = db.prepare('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC').all(p.id) as any[]
    const team = db.prepare('SELECT * FROM project_members WHERE project_id = ?').all(p.id) as any[]
    return { ...p, milestones, team }
  })
}

// ──────────────────────────────────────────────────────────────
// INDUSTRY FUNDING COMMITMENTS
// ──────────────────────────────────────────────────────────────

export async function createFundingCommitment(input: {
  challengeId: string
  projectId?: string
  partnerId: string
  partnerName: string
  institutionId?: string
  institutionName?: string
  amountLakhs: number
  type: 'CSR' | 'Seed Grant' | 'Co-Development' | 'Mentorship'
}): Promise<{ success: boolean; commitmentId?: string; error?: string }> {
  try {
    const { fundingCommitmentRepo } = await import('@/lib/db')
    const id = fundingCommitmentRepo.create(input)
    revalidatePath(`/industry/challenges/${input.challengeId}`)
    revalidatePath('/industry/commitments')
    revalidatePath('/admin')
    revalidatePath('/transparency')
    return { success: true, commitmentId: id }
  } catch (err) {
    console.error('[createFundingCommitment]', err)
    return { success: false, error: 'Failed to record commitment' }
  }
}

