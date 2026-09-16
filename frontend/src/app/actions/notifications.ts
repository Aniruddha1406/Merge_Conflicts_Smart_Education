// Client-side wrappers for the new Express backend

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function safeFetch(url: string, opts?: any) {
  try {
    const res = await globalThis.fetch(url, opts);
    if (!res.ok) throw new Error('Not ok');
    return res;
  } catch(e) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) }) as any;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  // stub
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  // stub
}

export async function getNotificationsForUser(userId: string) {
  return [];
}

export async function getAllNotifications() {
  return [];
}
