'use server'

// src/app/actions/notifications.ts
import { revalidatePath } from 'next/cache'
import { notificationRepo } from '@/lib/db'

export async function markNotificationRead(id: string): Promise<void> {
  notificationRepo.markRead(id)
  revalidatePath('/admin/notifications')
  revalidatePath('/citizen')
  revalidatePath('/university')
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  notificationRepo.markAllRead(userId)
  revalidatePath('/admin/notifications')
  revalidatePath('/citizen')
  revalidatePath('/university')
}

export async function getNotificationsForUser(userId: string) {
  return notificationRepo.findForUser(userId)
}

export async function getAllNotifications() {
  return notificationRepo.findAll()
}
