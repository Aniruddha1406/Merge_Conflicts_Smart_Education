// src/lib/db/init.ts
// Called once on server startup to ensure schema + seed data exist.
// Import this in the Next.js instrumentation file or layout.

let initialized = false

export async function initDatabase() {
  if (initialized) return
  initialized = true

  try {
    const { getDb } = await import('./index')
    getDb() // Runs schema if needed

    const { seed } = await import('./seed')
    seed()
  } catch (err) {
    console.error('[DB Init] Failed to initialize database:', err)
  }
}
