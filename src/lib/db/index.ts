// src/lib/db/index.ts
// Database access layer — SQLite via better-sqlite3
// Structured so it can be swapped for Postgres/Prisma without UI changes.

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Database file lives in the project root under .sicp-data/
const DATA_DIR = path.join(process.cwd(), '.sicp-data')
const DB_PATH = path.join(DATA_DIR, 'sicp.db')
const SCHEMA_PATH = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  const isNew = !fs.existsSync(DB_PATH)
  _db = new Database(DB_PATH)

  // Performance settings
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  _db.pragma('synchronous = NORMAL')

  // Run schema on first boot
  if (isNew) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')
    _db.exec(schema)
    console.log('[DB] Schema initialized at', DB_PATH)
  } else {
    // Always ensure schema is applied (idempotent IF NOT EXISTS)
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')
    _db.exec(schema)
  }

  return _db
}

// ──────────────────────────────────────────────────────────────
// GENERIC HELPERS
// ──────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${ts}${rand}`
}

/** Generate a human-readable sequential challenge ID: CH-YYYY-000001 */
export function generateChallengeId(): string {
  const db = getDb()
  const year = new Date().getFullYear()
  // Ensure row exists for current year
  db.prepare('INSERT OR IGNORE INTO challenge_seq (year, next_val) VALUES (?, 1)').run(year)
  // Atomically increment and read
  const row = db.prepare('UPDATE challenge_seq SET next_val = next_val + 1 WHERE year = ? RETURNING next_val').get(year) as { next_val: number } | undefined
  // Fallback if RETURNING not supported on older SQLite
  const seq = row?.next_val ?? (db.prepare('SELECT next_val FROM challenge_seq WHERE year = ?').get(year) as { next_val: number }).next_val
  const counter = String(seq - 1).padStart(6, '0')
  return `CH-${year}-${counter}`
}

export function now(): string {
  return new Date().toISOString()
}

// ──────────────────────────────────────────────────────────────
// CHALLENGES
// ──────────────────────────────────────────────────────────────

export interface DbChallenge {
  id: string
  title: string
  description: string
  domain: string
  district: string
  block?: string | null
  village?: string | null
  reporter_type: string
  submitted_by_id: string
  submitted_by_name: string
  submitted_at: string
  status: string
  endorsements: number
  urgency_score: number
  similar_count: number
  assigned_institution_id?: string | null
  assigned_institution_name?: string | null
  fit_score?: number | null
  lat?: number | null
  lng?: number | null
  ai_category?: string | null
  ai_subcategory?: string | null
  ai_priority?: string | null
  ai_keywords?: string | null
  ai_technical_core?: string | null
  ai_academic_field?: string | null
  ai_confidence?: number | null
  ai_triage?: string | null
  validated_at?: string | null
  validated_by?: string | null
  assigned_at?: string | null
  rejected_at?: string | null
  rejection_reason?: string | null
  flagged: number
  flag_reason?: string | null
  updated_at: string
}

export const challengeRepo = {
  findAll(): DbChallenge[] {
    return getDb().prepare('SELECT * FROM challenges ORDER BY submitted_at DESC').all() as DbChallenge[]
  },

  findById(id: string): DbChallenge | null {
    return getDb().prepare('SELECT * FROM challenges WHERE id = ?').get(id) as DbChallenge | null
  },

  findByUser(userId: string): DbChallenge[] {
    return getDb().prepare('SELECT * FROM challenges WHERE submitted_by_id = ? ORDER BY submitted_at DESC').all(userId) as DbChallenge[]
  },

  findByStatus(status: string): DbChallenge[] {
    return getDb().prepare('SELECT * FROM challenges WHERE status = ? ORDER BY urgency_score DESC').all(status) as DbChallenge[]
  },

  findByDistrict(district: string): DbChallenge[] {
    return getDb().prepare('SELECT * FROM challenges WHERE district = ?').all(district) as DbChallenge[]
  },

  countByStatus(): { status: string; count: number }[] {
    return getDb().prepare('SELECT status, COUNT(*) as count FROM challenges GROUP BY status').all() as { status: string; count: number }[]
  },

  countByDomain(): { domain: string; count: number }[] {
    return getDb().prepare('SELECT domain, COUNT(*) as count FROM challenges GROUP BY domain ORDER BY count DESC').all() as { domain: string; count: number }[]
  },

  countByDistrict(): { district: string; count: number }[] {
    return getDb().prepare('SELECT district, COUNT(*) as count FROM challenges GROUP BY district ORDER BY count DESC').all() as { district: string; count: number }[]
  },

  insert(c: Omit<DbChallenge, 'updated_at'>): DbChallenge {
    const stmt = getDb().prepare(`
      INSERT INTO challenges (
        id, title, description, domain, district, block, village,
        reporter_type,
        submitted_by_id, submitted_by_name, submitted_at, status,
        endorsements, urgency_score, similar_count,
        lat, lng, ai_category, ai_subcategory, ai_priority, ai_keywords,
        ai_technical_core, ai_academic_field, ai_confidence, ai_triage,
        flagged, updated_at
      ) VALUES (
        @id, @title, @description, @domain, @district, @block, @village,
        @reporter_type,
        @submitted_by_id, @submitted_by_name, @submitted_at, @status,
        @endorsements, @urgency_score, @similar_count,
        @lat, @lng, @ai_category, @ai_subcategory, @ai_priority, @ai_keywords,
        @ai_technical_core, @ai_academic_field, @ai_confidence, @ai_triage,
        @flagged, @updated_at
      )
    `)
    stmt.run({ ...c, updated_at: now() })
    return this.findById(c.id)!
  },

  updateStatus(id: string, status: string, extra: Record<string, unknown> = {}): void {
    const sets = ['status = @status', 'updated_at = @updated_at', ...Object.keys(extra).map(k => `${k} = @${k}`)]
    getDb().prepare(`UPDATE challenges SET ${sets.join(', ')} WHERE id = @id`).run({
      id, status, updated_at: now(), ...extra
    })
  },

  assign(id: string, institutionId: string, institutionName: string, fitScore: number): void {
    getDb().prepare(`
      UPDATE challenges SET
        status = 'Assigned to Institution',
        assigned_institution_id = ?,
        assigned_institution_name = ?,
        fit_score = ?,
        assigned_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(institutionId, institutionName, fitScore, now(), now(), id)
  },

  endorse(id: string, userId: string): boolean {
    try {
      getDb().prepare('INSERT INTO endorsements (id, challenge_id, user_id) VALUES (?, ?, ?)').run(generateId('END'), id, userId)
      getDb().prepare('UPDATE challenges SET endorsements = endorsements + 1, updated_at = ? WHERE id = ?').run(now(), id)
      return true
    } catch {
      return false // already endorsed
    }
  },

  flag(id: string, reason: string): void {
    getDb().prepare('UPDATE challenges SET flagged = 1, flag_reason = ?, updated_at = ? WHERE id = ?').run(reason, now(), id)
  },

  search(query: string): DbChallenge[] {
    const q = `%${query.toLowerCase()}%`
    return getDb().prepare(`
      SELECT * FROM challenges
      WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(domain) LIKE ?
      ORDER BY urgency_score DESC
      LIMIT 20
    `).all(q, q, q) as DbChallenge[]
  }
}

// ──────────────────────────────────────────────────────────────
// CHALLENGE EVIDENCE (file uploads)
// ──────────────────────────────────────────────────────────────

export interface DbChallengeEvidence {
  id: string
  challenge_id: string
  file_type: string
  file_name: string
  file_url?: string | null
  storage_path?: string | null
  file_size: number
  uploaded_by_id?: string | null
  uploaded_at: string
}

export const evidenceRepo = {
  findByChallenge(challengeId: string): DbChallengeEvidence[] {
    return getDb().prepare('SELECT * FROM challenge_evidence WHERE challenge_id = ? ORDER BY uploaded_at DESC').all(challengeId) as DbChallengeEvidence[]
  },

  countByChallenge(challengeId: string): number {
    const r = getDb().prepare('SELECT COUNT(*) as c FROM challenge_evidence WHERE challenge_id = ?').get(challengeId) as { c: number }
    return r.c
  },

  insert(e: DbChallengeEvidence): void {
    getDb().prepare(`
      INSERT INTO challenge_evidence (id, challenge_id, file_type, file_name, file_url, storage_path, file_size, uploaded_by_id, uploaded_at)
      VALUES (@id, @challenge_id, @file_type, @file_name, @file_url, @storage_path, @file_size, @uploaded_by_id, @uploaded_at)
    `).run(e)
  }
}

// ──────────────────────────────────────────────────────────────
// DUPLICATE CLUSTERS
// ──────────────────────────────────────────────────────────────

export interface DbDuplicateCluster {
  id: string
  primary_challenge_id: string
  district: string
  merged_urgency: number
  merged_endorsements: number
  merged_at?: string | null
  status: string
}

export interface DbDuplicateMatch {
  id: string
  cluster_id: string
  challenge_id: string
  similarity_score: number
  title: string
}

export const clusterRepo = {
  findAll(): (DbDuplicateCluster & { matches: DbDuplicateMatch[] })[] {
    const clusters = getDb().prepare('SELECT * FROM duplicate_clusters ORDER BY merged_urgency DESC').all() as DbDuplicateCluster[]
    return clusters.map(c => ({
      ...c,
      matches: getDb().prepare('SELECT * FROM duplicate_matches WHERE cluster_id = ?').all(c.id) as DbDuplicateMatch[]
    }))
  },

  findPending(): (DbDuplicateCluster & { matches: DbDuplicateMatch[] })[] {
    const clusters = getDb().prepare("SELECT * FROM duplicate_clusters WHERE status = 'pending' ORDER BY merged_urgency DESC").all() as DbDuplicateCluster[]
    return clusters.map(c => ({
      ...c,
      matches: getDb().prepare('SELECT * FROM duplicate_matches WHERE cluster_id = ?').all(c.id) as DbDuplicateMatch[]
    }))
  },

  insert(cluster: DbDuplicateCluster, matches: Omit<DbDuplicateMatch, 'id' | 'cluster_id'>[]): void {
    const db = getDb()
    const insertCluster = db.prepare(`
      INSERT OR IGNORE INTO duplicate_clusters (id, primary_challenge_id, district, merged_urgency, merged_endorsements, status)
      VALUES (@id, @primary_challenge_id, @district, @merged_urgency, @merged_endorsements, @status)
    `)
    const insertMatch = db.prepare(`
      INSERT OR IGNORE INTO duplicate_matches (id, cluster_id, challenge_id, similarity_score, title)
      VALUES (@id, @cluster_id, @challenge_id, @similarity_score, @title)
    `)
    const tx = db.transaction(() => {
      insertCluster.run(cluster)
      for (const m of matches) {
        insertMatch.run({ id: generateId('DM'), cluster_id: cluster.id, ...m })
      }
    })
    tx()
  },

  merge(clusterId: string): void {
    const db = getDb()
    const cluster = db.prepare('SELECT * FROM duplicate_clusters WHERE id = ?').get(clusterId) as DbDuplicateCluster
    if (!cluster) return
    db.prepare("UPDATE duplicate_clusters SET status = 'merged', merged_at = ? WHERE id = ?").run(now(), clusterId)
    // Boost urgency of primary
    db.prepare('UPDATE challenges SET urgency_score = MIN(100, urgency_score + 8), updated_at = ? WHERE id = ?')
      .run(now(), cluster.primary_challenge_id)
  },

  dismiss(clusterId: string): void {
    getDb().prepare("UPDATE duplicate_clusters SET status = 'dismissed' WHERE id = ?").run(clusterId)
  }
}

// ──────────────────────────────────────────────────────────────
// ROUTING RECOMMENDATIONS
// ──────────────────────────────────────────────────────────────

export interface DbRoutingRecommendation {
  id: string
  challenge_id: string
  institution_id: string
  institution_name: string
  fit_score: number
  match_basis: string
  generated_at: string
}

export const routingRepo = {
  findForChallenge(challengeId: string): DbRoutingRecommendation[] {
    return getDb().prepare('SELECT * FROM routing_recommendations WHERE challenge_id = ? ORDER BY fit_score DESC').all(challengeId) as DbRoutingRecommendation[]
  },

  upsert(recs: DbRoutingRecommendation[]): void {
    const stmt = getDb().prepare(`
      INSERT OR REPLACE INTO routing_recommendations (id, challenge_id, institution_id, institution_name, fit_score, match_basis, generated_at)
      VALUES (@id, @challenge_id, @institution_id, @institution_name, @fit_score, @match_basis, @generated_at)
    `)
    const tx = getDb().transaction(() => recs.forEach(r => stmt.run(r)))
    tx()
  }
}

// ──────────────────────────────────────────────────────────────
// INSTITUTIONS
// ──────────────────────────────────────────────────────────────

export interface DbInstitution {
  id: string
  name: string
  short_name: string
  type: string
  location: string
  incubation_center: number
  active_projects: number
  created_at: string
  departments?: string[]
  expertise?: string[]
}

export const institutionRepo = {
  findAll(): DbInstitution[] {
    const insts = getDb().prepare('SELECT * FROM institutions ORDER BY name').all() as DbInstitution[]
    return insts.map(i => ({
      ...i,
      departments: (getDb().prepare('SELECT name FROM institution_departments WHERE institution_id = ?').all(i.id) as { name: string }[]).map(d => d.name),
      expertise: (getDb().prepare('SELECT tag FROM institution_expertise WHERE institution_id = ?').all(i.id) as { tag: string }[]).map(e => e.tag)
    }))
  },

  findById(id: string): DbInstitution | null {
    const inst = getDb().prepare('SELECT * FROM institutions WHERE id = ?').get(id) as DbInstitution | null
    if (!inst) return null
    inst.departments = (getDb().prepare('SELECT name FROM institution_departments WHERE institution_id = ?').all(id) as { name: string }[]).map(d => d.name)
    inst.expertise = (getDb().prepare('SELECT tag FROM institution_expertise WHERE institution_id = ?').all(id) as { tag: string }[]).map(e => e.tag)
    return inst
  },

  findByShortName(shortName: string): DbInstitution | null {
    const inst = getDb().prepare('SELECT * FROM institutions WHERE short_name = ?').get(shortName) as DbInstitution | null
    if (!inst) return null
    return this.findById(inst.id)
  }
}

// ──────────────────────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────────────────────

export interface DbProject {
  id: string
  challenge_id: string
  title: string
  institution_id: string
  institution_name: string
  industry_partner_id?: string | null
  industry_partner_name?: string | null
  status: string
  start_date: string
  target_date: string
  created_at: string
  updated_at: string
}

export interface DbProjectMember {
  id: string
  project_id: string
  user_id?: string | null
  name: string
  role: string
  department?: string | null
  credit_hours: number
}

export interface DbMilestone {
  id: string
  project_id: string
  title: string
  description: string
  due_date: string
  completed: number
  completed_date?: string | null
  student_hours: number
  rubric_score?: number | null
  faculty_approved: number
  faculty_approved_by?: string | null
  faculty_approved_at?: string | null
  created_at: string
  deliverables?: string[]
}

export const projectRepo = {
  findAll(): (DbProject & { milestones: DbMilestone[]; team: DbProjectMember[] })[] {
    const projects = getDb().prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as DbProject[]
    return projects.map(p => this._hydrate(p))
  },

  findById(id: string): (DbProject & { milestones: DbMilestone[]; team: DbProjectMember[] }) | null {
    const p = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as DbProject | null
    if (!p) return null
    return this._hydrate(p)
  },

  findByChallenge(challengeId: string): (DbProject & { milestones: DbMilestone[]; team: DbProjectMember[] }) | null {
    const p = getDb().prepare('SELECT * FROM projects WHERE challenge_id = ?').get(challengeId) as DbProject | null
    if (!p) return null
    return this._hydrate(p)
  },

  findByInstitution(institutionId: string): (DbProject & { milestones: DbMilestone[]; team: DbProjectMember[] })[] {
    const projects = getDb().prepare('SELECT * FROM projects WHERE institution_id = ? ORDER BY created_at DESC').all(institutionId) as DbProject[]
    return projects.map(p => this._hydrate(p))
  },

  _hydrate(p: DbProject): DbProject & { milestones: DbMilestone[]; team: DbProjectMember[] } {
    const milestones = getDb().prepare('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date').all(p.id) as DbMilestone[]
    for (const m of milestones) {
      m.deliverables = (getDb().prepare('SELECT title FROM milestone_deliverables WHERE milestone_id = ?').all(m.id) as { title: string }[]).map(d => d.title)
    }
    const team = getDb().prepare('SELECT * FROM project_members WHERE project_id = ?').all(p.id) as DbProjectMember[]
    return { ...p, milestones, team }
  },

  insert(p: DbProject, team: Omit<DbProjectMember, 'id' | 'project_id'>[], milestones: (Omit<DbMilestone, 'id' | 'project_id' | 'created_at'> & { deliverables?: string[] })[]): DbProject {
    const db = getDb()
    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO projects (id, challenge_id, title, institution_id, institution_name,
          industry_partner_id, industry_partner_name, status, start_date, target_date, created_at, updated_at)
        VALUES (@id, @challenge_id, @title, @institution_id, @institution_name,
          @industry_partner_id, @industry_partner_name, @status, @start_date, @target_date, @created_at, @updated_at)
      `).run(p)

      for (const m of team) {
        db.prepare(`
          INSERT INTO project_members (id, project_id, user_id, name, role, department, credit_hours)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(generateId('PM'), p.id, m.user_id || null, m.name, m.role, m.department || null, m.credit_hours || 0)
      }

      for (const ms of milestones) {
        const msId = generateId('MS')
        db.prepare(`
          INSERT INTO milestones (id, project_id, title, description, due_date, completed, student_hours, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
        `).run(msId, p.id, ms.title, ms.description, ms.due_date, ms.student_hours)
        for (const d of (ms.deliverables || [])) {
          db.prepare('INSERT INTO milestone_deliverables (id, milestone_id, title) VALUES (?, ?, ?)').run(generateId('DL'), msId, d)
        }
      }
    })
    tx()
    return p
  },

  updateStatus(id: string, status: string): void {
    getDb().prepare('UPDATE projects SET status = ?, updated_at = ? WHERE id = ?').run(status, now(), id)
  },

  completeMilestone(milestoneId: string, rubricScore: number, studentHours: number): void {
    getDb().prepare(`
      UPDATE milestones SET completed = 1, completed_date = ?, rubric_score = ?, student_hours = ?
      WHERE id = ?
    `).run(now().split('T')[0], rubricScore, studentHours, milestoneId)
  },

  approveMilestone(milestoneId: string, facultyName: string): void {
    getDb().prepare(`
      UPDATE milestones SET faculty_approved = 1, faculty_approved_by = ?, faculty_approved_at = ?
      WHERE id = ?
    `).run(facultyName, now(), milestoneId)
  },

  addMilestone(projectId: string, ms: { title: string; description: string; due_date: string; student_hours: number; deliverables?: string[] }): string {
    const msId = generateId('MS')
    const db = getDb()
    db.prepare(`
      INSERT INTO milestones (id, project_id, title, description, due_date, completed, student_hours, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
    `).run(msId, projectId, ms.title, ms.description, ms.due_date, ms.student_hours)
    for (const d of (ms.deliverables || [])) {
      db.prepare('INSERT INTO milestone_deliverables (id, milestone_id, title) VALUES (?, ?, ?)').run(generateId('DL'), msId, d)
    }
    return msId
  }
}

// ──────────────────────────────────────────────────────────────
// INDUSTRY PARTNERS
// ──────────────────────────────────────────────────────────────

export interface DbIndustryPartner {
  id: string
  name: string
  sector: string
  active_commitments: number
  total_funding_crore: number
  created_at: string
  capabilities?: string[]
  csr_areas?: string[]
}

export const industryRepo = {
  findAll(): DbIndustryPartner[] {
    const partners = getDb().prepare('SELECT * FROM industry_partners ORDER BY name').all() as DbIndustryPartner[]
    return partners.map(p => ({
      ...p,
      capabilities: (getDb().prepare('SELECT capability FROM industry_capabilities WHERE partner_id = ?').all(p.id) as { capability: string }[]).map(c => c.capability),
      csr_areas: (getDb().prepare('SELECT domain FROM industry_csr_areas WHERE partner_id = ?').all(p.id) as { domain: string }[]).map(c => c.domain)
    }))
  },

  findById(id: string): DbIndustryPartner | null {
    const p = getDb().prepare('SELECT * FROM industry_partners WHERE id = ?').get(id) as DbIndustryPartner | null
    if (!p) return null
    p.capabilities = (getDb().prepare('SELECT capability FROM industry_capabilities WHERE partner_id = ?').all(id) as { capability: string }[]).map(c => c.capability)
    p.csr_areas = (getDb().prepare('SELECT domain FROM industry_csr_areas WHERE partner_id = ?').all(id) as { domain: string }[]).map(c => c.domain)
    return p
  }
}

// ──────────────────────────────────────────────────────────────
// FUNDING COMMITMENTS
// ──────────────────────────────────────────────────────────────

export interface DbFundingCommitment {
  id: string
  challenge_id: string
  project_id?: string | null
  partner_id: string
  partner_name: string
  institution_id?: string | null
  institution_name?: string | null
  amount_lakhs: number
  type: string
  status: string
  disbursed_lakhs: number
  interest_type?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export const commitmentRepo = {
  findAll(): DbFundingCommitment[] {
    return getDb().prepare('SELECT * FROM funding_commitments ORDER BY created_at DESC').all() as DbFundingCommitment[]
  },

  findByPartner(partnerId: string): DbFundingCommitment[] {
    return getDb().prepare('SELECT * FROM funding_commitments WHERE partner_id = ?').all(partnerId) as DbFundingCommitment[]
  },

  insert(c: Omit<DbFundingCommitment, 'updated_at'>): DbFundingCommitment {
    getDb().prepare(`
      INSERT INTO funding_commitments (id, challenge_id, project_id, partner_id, partner_name,
        institution_id, institution_name, amount_lakhs, type, status, disbursed_lakhs,
        interest_type, notes, created_at, updated_at)
      VALUES (@id, @challenge_id, @project_id, @partner_id, @partner_name,
        @institution_id, @institution_name, @amount_lakhs, @type, @status, @disbursed_lakhs,
        @interest_type, @notes, @created_at, @updated_at)
    `).run({ ...c, updated_at: now() })
    return getDb().prepare('SELECT * FROM funding_commitments WHERE id = ?').get(c.id) as DbFundingCommitment
  }
}

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────────

export interface DbNotification {
  id: string
  recipient_id: string
  type: string
  title: string
  body: string
  read: number
  channel: string
  delivery_status: string
  related_challenge_id?: string | null
  related_project_id?: string | null
  created_at: string
}

export const notificationRepo = {
  findForUser(userId: string): DbNotification[] {
    return getDb().prepare('SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 50').all(userId) as DbNotification[]
  },

  findAll(): DbNotification[] {
    return getDb().prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100').all() as DbNotification[]
  },

  countUnread(userId: string): number {
    const r = getDb().prepare('SELECT COUNT(*) as c FROM notifications WHERE recipient_id = ? AND read = 0').get(userId) as { c: number }
    return r.c
  },

  insert(n: Omit<DbNotification, 'read'>): void {
    getDb().prepare(`
      INSERT INTO notifications (id, recipient_id, type, title, body, read, channel, delivery_status,
        related_challenge_id, related_project_id, created_at)
      VALUES (@id, @recipient_id, @type, @title, @body, 0, @channel, @delivery_status,
        @related_challenge_id, @related_project_id, @created_at)
    `).run(n)
  },

  markRead(id: string): void {
    getDb().prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id)
  },

  markAllRead(userId: string): void {
    getDb().prepare('UPDATE notifications SET read = 1 WHERE recipient_id = ?').run(userId)
  }
}

// ──────────────────────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────────────────────

export interface DbUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  institution_id?: string | null
  district?: string | null
  created_at: string
  updated_at: string
}

export const userRepo = {
  findAll(): DbUser[] {
    return getDb().prepare('SELECT * FROM users ORDER BY name').all() as DbUser[]
  },

  findById(id: string): DbUser | null {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | null
  },

  findByRole(role: string): DbUser[] {
    return getDb().prepare('SELECT * FROM users WHERE role = ? ORDER BY name').all(role) as DbUser[]
  },

  findByEmail(email: string): DbUser | null {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | null
  }
}

// ──────────────────────────────────────────────────────────────
// VERIFICATION
// ──────────────────────────────────────────────────────────────

export interface DbVerificationRequest {
  id: string
  challenge_id: string
  project_id?: string | null
  requested_at: string
  deadline?: string | null
  status: string
}

export const verificationRepo = {
  findForChallenge(challengeId: string): DbVerificationRequest | null {
    return getDb().prepare('SELECT * FROM verification_requests WHERE challenge_id = ? ORDER BY requested_at DESC LIMIT 1').get(challengeId) as DbVerificationRequest | null
  },

  create(challengeId: string, projectId?: string): string {
    const id = generateId('VR')
    getDb().prepare('INSERT INTO verification_requests (id, challenge_id, project_id, status) VALUES (?, ?, ?, ?)').run(id, challengeId, projectId || null, 'pending')
    return id
  },

  submitEvidence(requestId: string, userId: string, data: { lat?: number; lng?: number; comments?: string; photoUrl?: string }): void {
    const evidenceId = generateId('VE')
    getDb().prepare(`
      INSERT INTO verification_evidence (id, request_id, submitted_by_id, submitted_at, lat, lng, confirmed_by_reporter, comments, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(evidenceId, requestId, userId, now(), data.lat || null, data.lng || null, data.comments || null, data.photoUrl || null)
    getDb().prepare("UPDATE verification_requests SET status = 'submitted' WHERE id = ?").run(requestId)
  },

  approve(requestId: string, adminName: string): void {
    getDb().prepare(`
      UPDATE verification_evidence SET admin_verified = 1, admin_verified_by = ?, admin_verified_at = ?
      WHERE request_id = ?
    `).run(adminName, now(), requestId)
    getDb().prepare("UPDATE verification_requests SET status = 'approved' WHERE id = ?").run(requestId)
  }
}

// ──────────────────────────────────────────────────────────────
// ACADEMIC CREDITS
// ──────────────────────────────────────────────────────────────

export interface DbAcademicCredit {
  id: string
  student_id: string
  student_name: string
  project_id: string
  milestone_id?: string | null
  hours_logged: number
  credit_points: number
  rubric_score?: number | null
  faculty_verified: number
  faculty_id?: string | null
  faculty_name?: string | null
  verified_at?: string | null
  created_at: string
}

export const creditRepo = {
  findForProject(projectId: string): DbAcademicCredit[] {
    return getDb().prepare('SELECT * FROM academic_credits WHERE project_id = ?').all(projectId) as DbAcademicCredit[]
  },

  findAll(): DbAcademicCredit[] {
    return getDb().prepare('SELECT * FROM academic_credits ORDER BY created_at DESC').all() as DbAcademicCredit[]
  }
}

// ──────────────────────────────────────────────────────────────
// FUNDING COMMITMENTS
// ──────────────────────────────────────────────────────────────

export interface DbFundingCommitment {
  id: string
  challenge_id: string
  project_id?: string | null
  partner_id: string
  partner_name: string
  institution_id?: string | null
  institution_name?: string | null
  amount_lakhs: number
  type: string
  status: string
  disbursed_lakhs: number
  created_at: string
}

export const fundingCommitmentRepo = {
  findAll(): DbFundingCommitment[] {
    return getDb().prepare('SELECT * FROM funding_commitments ORDER BY created_at DESC').all() as DbFundingCommitment[]
  },

  create(data: {
    challengeId: string
    projectId?: string
    partnerId: string
    partnerName: string
    institutionId?: string
    institutionName?: string
    amountLakhs: number
    type: 'CSR' | 'Seed Grant' | 'Co-Development' | 'Mentorship'
  }): string {
    const id = generateId('FC')
    getDb().prepare(`
      INSERT INTO funding_commitments (id, challenge_id, project_id, partner_id, partner_name, institution_id, institution_name, amount_lakhs, type, status, disbursed_lakhs, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 0, ?, ?)
    `).run(
      id,
      data.challengeId,
      data.projectId || null,
      data.partnerId,
      data.partnerName,
      data.institutionId || null,
      data.institutionName || null,
      data.amountLakhs,
      data.type,
      now(),
      now()
    )
    return id
  }
}


// ──────────────────────────────────────────────────────────────
// AUDIT LOG
// ──────────────────────────────────────────────────────────────

export function auditLog(userId: string, userName: string, action: string, entityType: string, entityId: string, details?: string): void {
  getDb().prepare(`
    INSERT INTO audit_log (id, user_id, user_name, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(generateId('AL'), userId, userName, action, entityType, entityId, details || null)
}

// ──────────────────────────────────────────────────────────────
// DASHBOARD AGGREGATES
// ──────────────────────────────────────────────────────────────

export function getDashboardStats() {
  const db = getDb()
  const total = (db.prepare('SELECT COUNT(*) as c FROM challenges').get() as { c: number }).c
  const resolved = (db.prepare("SELECT COUNT(*) as c FROM challenges WHERE status = 'Resolved'").get() as { c: number }).c
  const inProgress = (db.prepare("SELECT COUNT(*) as c FROM challenges WHERE status = 'In Progress'").get() as { c: number }).c
  const assigned = (db.prepare("SELECT COUNT(*) as c FROM challenges WHERE status = 'Assigned to Institution'").get() as { c: number }).c
  const validated = (db.prepare("SELECT COUNT(*) as c FROM challenges WHERE status = 'Validated'").get() as { c: number }).c
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'Active'").get() as { c: number }).c
  const completedProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'Completed'").get() as { c: number }).c
  const institutionsEngaged = (db.prepare('SELECT COUNT(DISTINCT institution_id) as c FROM projects').get() as { c: number }).c
  const industryPartners = (db.prepare('SELECT COUNT(*) as c FROM industry_partners').get() as { c: number }).c
  const totalHours = (db.prepare('SELECT SUM(student_hours) as h FROM milestones WHERE completed = 1').get() as { h: number }).h || 0
  const creditsAwarded = Math.round(totalHours / 30)
  const byDomain = db.prepare('SELECT domain, COUNT(*) as count FROM challenges GROUP BY domain ORDER BY count DESC').all() as { domain: string; count: number }[]
  const byDistrict = db.prepare('SELECT district, COUNT(*) as count FROM challenges GROUP BY district ORDER BY count DESC LIMIT 10').all() as { district: string; count: number }[]
  const fundingCommitted = (db.prepare("SELECT COALESCE(SUM(amount_lakhs),0) as s FROM funding_commitments WHERE status != 'Withdrawn'").get() as { s: number }).s / 100
  const patentsFiled = (db.prepare("SELECT COUNT(*) as c FROM ip_declarations WHERE status IN ('filed','published','granted')").get() as { c: number }).c

  return {
    totalSubmissions: total,
    resolvedSubmissions: resolved,
    inProgress,
    assigned,
    validated,
    institutionsEngaged: Math.max(institutionsEngaged, 0),
    industryPartners,
    projectsActive: activeProjects,
    projectsCompleted: completedProjects,
    creditsAwarded,
    patentsFiled,
    startupsSpawned: 0, // No startup tracking implemented
    districtsCovered: byDistrict.length,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100 * 10) / 10 : 0,
    avgTimeToAssign: 0, // Would require timestamp diff calculation
    fundingCommittedCrore: Math.round(fundingCommitted * 10) / 10,
    communityDeployments: completedProjects,
    submissionsByDomain: byDomain,
    submissionsByDistrict: byDistrict,
  }
}
