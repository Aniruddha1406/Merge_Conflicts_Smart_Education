// src/lib/services/notificationService.ts
// Notification service — creates in-app notifications and demo SMS/voice entries.
// Architecture: pluggable delivery providers.

import { notificationRepo, generateId, now, type DbNotification } from '@/lib/db'

export type NotificationChannel = 'in_app' | 'sms_demo' | 'voice_demo'
export type NotificationDeliveryStatus = 'delivered' | 'pending' | 'demo'

export interface CreateNotificationInput {
  recipientId: string
  type: string
  title: string
  body: string
  channel?: NotificationChannel
  relatedChallengeId?: string
  relatedProjectId?: string
}

// ──────────────────────────────────────────────────────────────
// CORE CREATE
// ──────────────────────────────────────────────────────────────

export function createNotification(input: CreateNotificationInput): void {
  const channel = input.channel || 'in_app'
  const deliveryStatus: NotificationDeliveryStatus =
    channel === 'in_app' ? 'delivered' : 'demo'

  notificationRepo.insert({
    id: generateId('NT'),
    recipient_id: input.recipientId,
    type: input.type,
    title: input.title,
    body: input.body,
    channel,
    delivery_status: deliveryStatus,
    related_challenge_id: input.relatedChallengeId || null,
    related_project_id: input.relatedProjectId || null,
    created_at: now(),
  })
}

// ──────────────────────────────────────────────────────────────
// DOMAIN EVENTS — standard notifications per workflow step
// ──────────────────────────────────────────────────────────────

export function notifyChallengeSubmitted(
  citizenId: string,
  challengeId: string,
  challengeTitle: string,
  adminIds: string[]
): void {
  // Confirm to citizen
  createNotification({
    recipientId: citizenId,
    type: 'new_submission',
    title: 'Challenge Submitted Successfully',
    body: `Your challenge "${challengeTitle}" (${challengeId}) has been received and is under review.`,
    relatedChallengeId: challengeId,
  })

  // Notify all admins
  for (const adminId of adminIds) {
    createNotification({
      recipientId: adminId,
      type: 'new_submission',
      title: `New Challenge: ${challengeTitle}`,
      body: `Challenge ${challengeId} from district submitted for review.`,
      relatedChallengeId: challengeId,
    })
  }
}

export function notifyChallengeValidated(
  citizenId: string,
  challengeId: string,
  challengeTitle: string
): void {
  createNotification({
    recipientId: citizenId,
    type: 'assigned',
    title: 'Challenge Validated',
    body: `Your challenge "${challengeTitle}" has been validated by the government and will be assigned to an institution shortly.`,
    relatedChallengeId: challengeId,
  })
}

export function notifyChallengeAssigned(
  citizenId: string,
  challengeId: string,
  challengeTitle: string,
  institutionName: string,
  universityAdminId: string
): void {
  createNotification({
    recipientId: citizenId,
    type: 'assigned',
    title: 'Challenge Assigned to Institution',
    body: `Your challenge "${challengeTitle}" has been assigned to ${institutionName} for resolution.`,
    relatedChallengeId: challengeId,
  })

  createNotification({
    recipientId: universityAdminId,
    type: 'assigned',
    title: `New Challenge Assignment: ${challengeTitle}`,
    body: `Challenge ${challengeId} has been routed to your institution. Please review and accept.`,
    relatedChallengeId: challengeId,
  })
}

export function notifyMilestoneComplete(
  projectId: string,
  milestoneTitle: string,
  citizenId: string,
  adminId: string
): void {
  const notifs = [
    { recipientId: citizenId, body: `A milestone has been completed for your challenge project: "${milestoneTitle}".` },
    { recipientId: adminId, body: `Milestone "${milestoneTitle}" has been completed. Project ${projectId} is progressing.` },
  ]
  for (const n of notifs) {
    createNotification({
      recipientId: n.recipientId,
      type: 'milestone_complete',
      title: `Milestone Completed: ${milestoneTitle}`,
      body: n.body,
      relatedProjectId: projectId,
    })
  }
}

export function notifyVerificationRequested(
  citizenId: string,
  challengeId: string,
  challengeTitle: string
): void {
  createNotification({
    recipientId: citizenId,
    type: 'verification_requested',
    title: 'Verification Required',
    body: `Your challenge "${challengeTitle}" has been resolved by the project team. Please verify the fix on the ground and submit photo evidence.`,
    relatedChallengeId: challengeId,
  })
}

export function notifyChallengeResolved(
  citizenId: string,
  challengeId: string,
  challengeTitle: string,
  adminId: string
): void {
  createNotification({
    recipientId: citizenId,
    type: 'resolved',
    title: 'Challenge Resolved!',
    body: `Your challenge "${challengeTitle}" has been successfully resolved. Thank you for making Jharkhand better!`,
    relatedChallengeId: challengeId,
  })
  createNotification({
    recipientId: adminId,
    type: 'resolved',
    title: `Challenge Resolved: ${challengeTitle}`,
    body: `Challenge ${challengeId} has been verified and closed.`,
    relatedChallengeId: challengeId,
  })
}
