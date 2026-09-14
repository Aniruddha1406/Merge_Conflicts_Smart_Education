-- SIH26043 Societal Innovation Collaboration Portal
-- SQLite Schema

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================
-- USERS & ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK(role IN ('citizen','university','faculty','student','industry','government','superadmin')),
  institution_id TEXT,
  district TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INSTITUTIONS (HEIs)
-- ============================================================
CREATE TABLE IF NOT EXISTS institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('University','IIT','NIT','College','Medical')),
  location TEXT NOT NULL,
  incubation_center INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS institution_departments (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS institution_expertise (
  id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  tag TEXT NOT NULL
);

-- ============================================================
-- SEQUENTIAL ID COUNTER (for human-readable IDs: CH-2026-000001)
-- ============================================================
CREATE TABLE IF NOT EXISTS challenge_seq (
  year INTEGER NOT NULL,
  next_val INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (year)
);

-- ============================================================
-- CHALLENGES
-- ============================================================
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL,
  district TEXT NOT NULL,
  block TEXT,
  village TEXT,
  reporter_type TEXT NOT NULL DEFAULT 'citizen' CHECK(reporter_type IN (
    'citizen','community_org','pri','ulb','government_agency','other'
  )),
  submitted_by_id TEXT NOT NULL REFERENCES users(id),
  submitted_by_name TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN (
    'Submitted','Under Review','Validated','Assigned to Institution',
    'In Progress','Pending Verification','Resolved','Rejected'
  )),
  endorsements INTEGER NOT NULL DEFAULT 0,
  urgency_score INTEGER NOT NULL DEFAULT 50,
  similar_count INTEGER NOT NULL DEFAULT 0,
  assigned_institution_id TEXT REFERENCES institutions(id),
  assigned_institution_name TEXT,
  fit_score REAL,
  lat REAL,
  lng REAL,
  ai_category TEXT,
  ai_subcategory TEXT,
  ai_priority TEXT,
  ai_keywords TEXT,
  ai_technical_core TEXT,
  ai_academic_field TEXT,
  ai_confidence REAL,
  ai_triage TEXT CHECK(ai_triage IN ('INNOVATION_CHALLENGE','ADMINISTRATIVE_ISSUE') OR ai_triage IS NULL),
  validated_at TEXT,
  validated_by TEXT,
  assigned_at TEXT,
  rejected_at TEXT,
  rejection_reason TEXT,
  flagged INTEGER NOT NULL DEFAULT 0,
  flag_reason TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS challenge_evidence (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  file_type TEXT NOT NULL CHECK(file_type IN ('image','video','audio','document')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  file_size INTEGER DEFAULT 0,
  uploaded_by_id TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- DUPLICATE CLUSTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS duplicate_clusters (
  id TEXT PRIMARY KEY,
  primary_challenge_id TEXT NOT NULL REFERENCES challenges(id),
  district TEXT NOT NULL,
  merged_urgency INTEGER NOT NULL DEFAULT 0,
  merged_endorsements INTEGER NOT NULL DEFAULT 0,
  merged_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','merged','dismissed'))
);

CREATE TABLE IF NOT EXISTS duplicate_matches (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES duplicate_clusters(id),
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  similarity_score REAL NOT NULL,
  title TEXT NOT NULL
);

-- ============================================================
-- ROUTING RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS routing_recommendations (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  institution_name TEXT NOT NULL,
  fit_score REAL NOT NULL,
  match_basis TEXT NOT NULL,
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  title TEXT NOT NULL,
  institution_id TEXT NOT NULL REFERENCES institutions(id),
  institution_name TEXT NOT NULL,
  industry_partner_id TEXT,
  industry_partner_name TEXT,
  status TEXT NOT NULL DEFAULT 'Planning' CHECK(status IN ('Planning','Active','Testing','Completed','Stalled')),
  start_date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('Faculty Mentor','Student','Student Lead','Student Researcher','Industry Mentor')),
  department TEXT,
  credit_hours REAL DEFAULT 0
);

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_date TEXT,
  student_hours INTEGER NOT NULL DEFAULT 0,
  rubric_score INTEGER,
  faculty_approved INTEGER NOT NULL DEFAULT 0,
  faculty_approved_by TEXT,
  faculty_approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS milestone_deliverables (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL REFERENCES milestones(id),
  title TEXT NOT NULL,
  file_url TEXT
);

-- ============================================================
-- INDUSTRY PARTNERS
-- ============================================================
CREATE TABLE IF NOT EXISTS industry_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  active_commitments INTEGER NOT NULL DEFAULT 0,
  total_funding_crore REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS industry_capabilities (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES industry_partners(id),
  capability TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS industry_csr_areas (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES industry_partners(id),
  domain TEXT NOT NULL
);

-- ============================================================
-- FUNDING COMMITMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS funding_commitments (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  project_id TEXT REFERENCES projects(id),
  partner_id TEXT NOT NULL REFERENCES industry_partners(id),
  partner_name TEXT NOT NULL,
  institution_id TEXT REFERENCES institutions(id),
  institution_name TEXT,
  amount_lakhs REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('CSR','Seed Grant','Co-Development','Mentorship')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Disbursed','Pending','Withdrawn')),
  disbursed_lakhs REAL NOT NULL DEFAULT 0,
  interest_type TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- VERIFICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS verification_requests (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  project_id TEXT REFERENCES projects(id),
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','submitted','approved','rejected'))
);

CREATE TABLE IF NOT EXISTS verification_evidence (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES verification_requests(id),
  submitted_by_id TEXT NOT NULL REFERENCES users(id),
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  photo_url TEXT,
  lat REAL,
  lng REAL,
  confirmed_by_reporter INTEGER NOT NULL DEFAULT 0,
  admin_verified INTEGER NOT NULL DEFAULT 0,
  admin_verified_by TEXT,
  admin_verified_at TEXT,
  comments TEXT
);

-- ============================================================
-- ACADEMIC CREDITS (ABC)
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_credits (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  student_name TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id),
  milestone_id TEXT REFERENCES milestones(id),
  hours_logged INTEGER NOT NULL DEFAULT 0,
  credit_points REAL NOT NULL DEFAULT 0,
  rubric_score INTEGER,
  faculty_verified INTEGER NOT NULL DEFAULT 0,
  faculty_id TEXT REFERENCES users(id),
  faculty_name TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- IP DECLARATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS ip_declarations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('Patent','Copyright','Trade Secret','Other')),
  inventors TEXT NOT NULL,
  filing_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','filed','published','granted')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK(channel IN ('in_app','sms_demo','voice_demo')),
  delivery_status TEXT NOT NULL DEFAULT 'delivered' CHECK(delivery_status IN ('pending','delivered','failed','demo')),
  related_challenge_id TEXT REFERENCES challenges(id),
  related_project_id TEXT REFERENCES projects(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ENDORSEMENTS (track who endorsed what)
-- ============================================================
CREATE TABLE IF NOT EXISTS endorsements (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(challenge_id, user_id)
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_domain ON challenges(domain);
CREATE INDEX IF NOT EXISTS idx_challenges_district ON challenges(district);
CREATE INDEX IF NOT EXISTS idx_challenges_submitted_by ON challenges(submitted_by_id);
CREATE INDEX IF NOT EXISTS idx_projects_challenge ON projects(challenge_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_funding_partner ON funding_commitments(partner_id);
CREATE INDEX IF NOT EXISTS idx_academic_credits_student ON academic_credits(student_id);
