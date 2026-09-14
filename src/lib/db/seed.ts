// src/lib/db/seed.ts
// Seeds the database with realistic demo data for SIH26043.
// Safe to run multiple times — uses INSERT OR IGNORE.

import { getDb, generateId, now } from './index'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), '.sicp-data')
const SEED_FLAG = path.join(DATA_DIR, '.seeded')

export function seed() {
  const db = getDb()
  
  try {
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
    if (userCount.c > 0) {
      console.log('[Seed] Database already contains data. Skipping seed.')
      return
    }
  } catch (err) {
    // Schema might not exist yet
  }

  const t = db.transaction(() => {
    seedUsers(db)
    seedInstitutions(db)
    seedIndustryPartners(db)
    seedChallenges(db)
    seedDuplicateClusters(db)
    seedProjects(db)
    seedFundingCommitments(db)
    seedNotifications(db)
    seedIPDeclarations(db)
  })
  t()

  fs.writeFileSync(SEED_FLAG, new Date().toISOString())
  console.log('[Seed] Database seeded successfully.')
}

// ──────────────────────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────────────────────
function seedUsers(db: ReturnType<typeof getDb>) {
  const users = [
    { id: 'U-CITIZEN-001', name: 'Priya Mahato', email: 'priya@demo.in', phone: '+91-9001234567', role: 'citizen', institution_id: null, district: 'Ranchi', created_at: now(), updated_at: now() },
    { id: 'U-CITIZEN-002', name: 'Rajan Hansda', email: 'rajan@demo.in', phone: '+91-9002234567', role: 'citizen', institution_id: null, district: 'Dumka', created_at: now(), updated_at: now() },
    { id: 'U-CITIZEN-003', name: 'Sunita Oraon', email: 'sunita@demo.in', phone: '+91-9003234567', role: 'citizen', institution_id: null, district: 'Gumla', created_at: now(), updated_at: now() },
    { id: 'U-CITIZEN-004', name: 'Mohan Munda', email: 'mohan@demo.in', phone: '+91-9004234567', role: 'citizen', institution_id: null, district: 'Lohardaga', created_at: now(), updated_at: now() },
    { id: 'U-UNI-001', name: 'Dr. Anjali Singh', email: 'anjali@bitmesra.ac.in', phone: null, role: 'university', institution_id: 'INST-001', district: null, created_at: now(), updated_at: now() },
    { id: 'U-UNI-002', name: 'Dr. Pradeep Kumar', email: 'pradeep@iitism.ac.in', phone: null, role: 'university', institution_id: 'INST-002', district: null, created_at: now(), updated_at: now() },
    { id: 'U-FAC-001', name: 'Prof. Suresh Verma', email: 'sverma@bitmesra.ac.in', phone: null, role: 'faculty', institution_id: 'INST-001', district: null, created_at: now(), updated_at: now() },
    { id: 'U-FAC-002', name: 'Prof. Meera Devi', email: 'meera@iitism.ac.in', phone: null, role: 'faculty', institution_id: 'INST-002', district: null, created_at: now(), updated_at: now() },
    { id: 'U-STU-001', name: 'Arjun Topno', email: 'arjun.t@bitmesra.ac.in', phone: null, role: 'student', institution_id: 'INST-001', district: null, created_at: now(), updated_at: now() },
    { id: 'U-STU-002', name: 'Kavya Soren', email: 'kavya.s@bitmesra.ac.in', phone: null, role: 'student', institution_id: 'INST-001', district: null, created_at: now(), updated_at: now() },
    { id: 'U-STU-003', name: 'Deepak Murmu', email: 'deepak.m@iitism.ac.in', phone: null, role: 'student', institution_id: 'INST-002', district: null, created_at: now(), updated_at: now() },
    { id: 'U-IND-001', name: 'Rajesh Tata', email: 'rajesh@tataprojects.com', phone: null, role: 'industry', institution_id: null, district: null, created_at: now(), updated_at: now() },
    { id: 'U-GOV-001', name: 'IAS Sanjeev Kumar', email: 'sanjeev@jharkhand.gov.in', phone: null, role: 'government', institution_id: null, district: null, created_at: now(), updated_at: now() },
    { id: 'U-GOV-002', name: 'IAS Rekha Devi', email: 'rekha@jharkhand.gov.in', phone: null, role: 'government', institution_id: null, district: null, created_at: now(), updated_at: now() },
    { id: 'U-SADMIN', name: 'Super Admin', email: 'admin@sicp.jharkhand.gov.in', phone: null, role: 'superadmin', institution_id: null, district: null, created_at: now(), updated_at: now() },
  ]
  const stmt = db.prepare('INSERT OR IGNORE INTO users (id,name,email,phone,role,institution_id,district,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
  for (const u of users) stmt.run(u.id, u.name, u.email, u.phone, u.role, u.institution_id, u.district, u.created_at, u.updated_at)
}

// ──────────────────────────────────────────────────────────────
// INSTITUTIONS
// ──────────────────────────────────────────────────────────────
function seedInstitutions(db: ReturnType<typeof getDb>) {
  const institutions = [
    { id: 'INST-001', name: 'Birla Institute of Technology, Mesra', short_name: 'BIT Mesra', type: 'University', location: 'Ranchi', incubation_center: 1, active_projects: 3 },
    { id: 'INST-002', name: 'Indian Institute of Technology (ISM)', short_name: 'IIT (ISM)', type: 'IIT', location: 'Dhanbad', incubation_center: 1, active_projects: 2 },
    { id: 'INST-003', name: 'National Institute of Technology Jamshedpur', short_name: 'NIT Jamshedpur', type: 'NIT', location: 'Jamshedpur', incubation_center: 0, active_projects: 2 },
    { id: 'INST-004', name: 'Central University of Jharkhand', short_name: 'CUJ', type: 'University', location: 'Ranchi', incubation_center: 0, active_projects: 1 },
    { id: 'INST-005', name: 'Ranchi University', short_name: 'RU', type: 'University', location: 'Ranchi', incubation_center: 0, active_projects: 1 },
  ]
  const dept_data: Record<string, string[]> = {
    'INST-001': ['Civil Engineering', 'Computer Science', 'Biotechnology', 'Environmental Engineering', 'Electronics', 'Mechanical Engineering', 'Management Studies'],
    'INST-002': ['Mining Engineering', 'Computer Science', 'Civil Engineering', 'Environmental Science', 'Chemistry', 'Remote Sensing & GIS'],
    'INST-003': ['Civil Engineering', 'Computer Science', 'Electrical Engineering', 'Production Engineering', 'Metallurgy'],
    'INST-004': ['Social Work', 'Geography', 'Tribal Studies', 'Agriculture', 'Environmental Studies'],
    'INST-005': ['Agriculture', 'Chemistry', 'Life Sciences', 'Geography', 'Economics'],
  }
  const expertise_data: Record<string, string[]> = {
    'INST-001': ['Water Technology', 'AI/ML', 'IoT & Embedded Systems', 'Environmental Engineering', 'Biotechnology', 'Robotics', 'Incubation & Startups'],
    'INST-002': ['Mining Technology', 'Remote Sensing', 'Environmental Monitoring', 'Agri-Tech', 'Coal Technology', 'GIS & Mapping'],
    'INST-003': ['Smart Infrastructure', 'Renewable Energy', 'Urban Planning', 'Advanced Manufacturing', 'Structural Engineering'],
    'INST-004': ['Tribal Welfare', 'Rural Development', 'Livelihood', 'Social Innovation', 'Governance'],
    'INST-005': ['Agriculture', 'Soil Science', 'Water Sanitation', 'Public Health', 'Food Technology'],
  }

  const instStmt = db.prepare('INSERT OR IGNORE INTO institutions (id,name,short_name,type,location,incubation_center,active_projects) VALUES (?,?,?,?,?,?,?)')
  const deptStmt = db.prepare('INSERT OR IGNORE INTO institution_departments (id,institution_id,name) VALUES (?,?,?)')
  const expStmt = db.prepare('INSERT OR IGNORE INTO institution_expertise (id,institution_id,tag) VALUES (?,?,?)')

  for (const inst of institutions) {
    instStmt.run(inst.id, inst.name, inst.short_name, inst.type, inst.location, inst.incubation_center, inst.active_projects)
    for (const dept of dept_data[inst.id] || []) {
      deptStmt.run(generateId('DEPT'), inst.id, dept)
    }
    for (const exp of expertise_data[inst.id] || []) {
      expStmt.run(generateId('EXP'), inst.id, exp)
    }
  }
}

// ──────────────────────────────────────────────────────────────
// INDUSTRY PARTNERS
// ──────────────────────────────────────────────────────────────
function seedIndustryPartners(db: ReturnType<typeof getDb>) {
  const partners = [
    { id: 'IND-001', name: 'Tata Projects Ltd.', sector: 'Infrastructure & Construction', active_commitments: 3, total_funding_crore: 5.0 },
    { id: 'IND-002', name: 'JSW Foundation', sector: 'Steel & Manufacturing', active_commitments: 2, total_funding_crore: 3.5 },
    { id: 'IND-003', name: 'JSPL CSR Foundation', sector: 'Steel & Power', active_commitments: 2, total_funding_crore: 2.8 },
    { id: 'IND-004', name: 'Vedanta Foundation', sector: 'Mining & Resources', active_commitments: 1, total_funding_crore: 2.0 },
  ]
  const caps: Record<string, string[]> = {
    'IND-001': ['Infrastructure Development', 'Project Management', 'Water Systems', 'Road Construction'],
    'IND-002': ['Manufacturing', 'Steel Technology', 'Skill Development', 'Community Development'],
    'IND-003': ['Power Systems', 'Steel Processing', 'Rural Electrification'],
    'IND-004': ['Mining Technology', 'Environmental Rehabilitation', 'Livelihood Programs'],
  }
  const csrAreas: Record<string, string[]> = {
    'IND-001': ['Water', 'Infrastructure', 'Education'],
    'IND-002': ['Education', 'Health', 'Livelihood'],
    'IND-003': ['Environment', 'Infrastructure', 'Agriculture'],
    'IND-004': ['Environment', 'Livelihood', 'Health'],
  }

  const pStmt = db.prepare('INSERT OR IGNORE INTO industry_partners (id,name,sector,active_commitments,total_funding_crore) VALUES (?,?,?,?,?)')
  const cStmt = db.prepare('INSERT OR IGNORE INTO industry_capabilities (id,partner_id,capability) VALUES (?,?,?)')
  const aStmt = db.prepare('INSERT OR IGNORE INTO industry_csr_areas (id,partner_id,domain) VALUES (?,?,?)')

  for (const p of partners) {
    pStmt.run(p.id, p.name, p.sector, p.active_commitments, p.total_funding_crore)
    for (const cap of caps[p.id] || []) cStmt.run(generateId('CAP'), p.id, cap)
    for (const area of csrAreas[p.id] || []) aStmt.run(generateId('CSR'), p.id, area)
  }
}

// ──────────────────────────────────────────────────────────────
// CHALLENGES
// ──────────────────────────────────────────────────────────────
function seedChallenges(db: ReturnType<typeof getDb>) {
  const challenges = [
    {
      id: 'CH-001', title: 'Handpump failure causing water scarcity in Bero block',
      description: 'The community handpump in Bero block, Ranchi has been non-functional for 3 months. Over 200 families depend on it for drinking water. Children are drinking contaminated water from the open stream. Cases of diarrhea have increased significantly.',
      domain: 'Water', district: 'Ranchi', village: 'Bero',
      submitted_by_id: 'U-CITIZEN-001', submitted_by_name: 'Priya Mahato',
      submitted_at: '2025-11-15T08:30:00Z', status: 'In Progress',
      endorsements: 47, urgency_score: 89, similar_count: 2,
      assigned_institution_id: 'INST-001', assigned_institution_name: 'BIT Mesra',
      fit_score: 0.91, lat: 23.35, lng: 85.28,
      ai_category: 'Water', ai_subcategory: 'Water Supply', ai_priority: 'Critical',
      ai_keywords: 'water,handpump,contamination,drinking,children,diarrhea',
      validated_at: '2025-11-16T10:00:00Z', validated_by: 'IAS Sanjeev Kumar',
      assigned_at: '2025-11-17T14:00:00Z',
      flagged: 0,
    },
    {
      id: 'CH-002', title: 'No road connectivity to tribal hamlet — Simdega',
      description: 'The tribal hamlet of Kendapara in Simdega district has no motorable road. During monsoon, residents are completely cut off. A pregnant woman had to be carried 8 km on a stretcher last month. Emergency services cannot reach the village.',
      domain: 'Infrastructure', district: 'Simdega', village: 'Kendapara',
      submitted_by_id: 'U-CITIZEN-003', submitted_by_name: 'Sunita Oraon',
      submitted_at: '2025-11-20T11:00:00Z', status: 'Assigned to Institution',
      endorsements: 89, urgency_score: 92, similar_count: 0,
      assigned_institution_id: 'INST-003', assigned_institution_name: 'NIT Jamshedpur',
      fit_score: 0.87, lat: 22.58, lng: 84.52,
      ai_category: 'Infrastructure', ai_subcategory: 'Roads', ai_priority: 'Critical',
      ai_keywords: 'road,bridge,connectivity,tribal,emergency,pregnant',
      validated_at: '2025-11-21T09:00:00Z', validated_by: 'IAS Rekha Devi',
      assigned_at: '2025-11-22T13:00:00Z',
      flagged: 0,
    },
    {
      id: 'CH-003', title: 'Crop failure due to unidentified disease — Dumka',
      description: 'Paddy crops across 15 villages in Dumka block are showing unusual yellowing and stunted growth. Farmers have lost 60% of their harvest. The Block Agriculture Officer has not visited in 6 months. Farmers are in debt and fear total loss.',
      domain: 'Agriculture', district: 'Dumka', village: 'Sunderpahari',
      submitted_by_id: 'U-CITIZEN-002', submitted_by_name: 'Rajan Hansda',
      submitted_at: '2025-11-25T07:00:00Z', status: 'Validated',
      endorsements: 34, urgency_score: 78, similar_count: 1,
      assigned_institution_id: null, assigned_institution_name: null,
      fit_score: null, lat: 24.27, lng: 87.25,
      ai_category: 'Agriculture', ai_subcategory: 'Crop Issues', ai_priority: 'High',
      ai_keywords: 'crop,paddy,disease,farmers,harvest,debt',
      validated_at: '2025-11-26T10:00:00Z', validated_by: 'IAS Sanjeev Kumar',
      flagged: 0,
    },
    {
      id: 'CH-004', title: 'Primary Health Centre non-functional for 2 years — Lohardaga',
      description: 'The PHC at Senha block has had no doctor for 2 years. The nurse attends only twice a week. Malaria and TB cases are rising. Patients travel 45km to Lohardaga town for basic treatment. Three children died of preventable diseases this year.',
      domain: 'Health', district: 'Lohardaga', village: 'Senha',
      submitted_by_id: 'U-CITIZEN-004', submitted_by_name: 'Mohan Munda',
      submitted_at: '2025-11-10T06:00:00Z', status: 'Under Review',
      endorsements: 123, urgency_score: 95, similar_count: 0,
      assigned_institution_id: null, assigned_institution_name: null,
      fit_score: null, lat: 23.43, lng: 84.68,
      ai_category: 'Health', ai_subcategory: 'Primary Healthcare', ai_priority: 'Critical',
      ai_keywords: 'health,doctor,malaria,TB,PHC,children,died',
      validated_at: null, validated_by: null,
      flagged: 0,
    },
    {
      id: 'CH-005', title: 'Solar pump installation failure — 3 villages without irrigation',
      description: 'The PM-KUSUM solar pump scheme installed equipment 8 months ago but none of the 3 pumps in Gumla district are functional. The contractor has disappeared. Farmers cannot irrigate their fields and crops are dying.',
      domain: 'Agriculture', district: 'Gumla', village: 'Chainpur',
      submitted_by_id: 'U-CITIZEN-003', submitted_by_name: 'Sunita Oraon',
      submitted_at: '2025-12-01T09:00:00Z', status: 'Submitted',
      endorsements: 12, urgency_score: 72, similar_count: 0,
      assigned_institution_id: null, assigned_institution_name: null,
      fit_score: null, lat: 23.05, lng: 84.43,
      ai_category: 'Agriculture', ai_subcategory: 'Irrigation', ai_priority: 'High',
      ai_keywords: 'solar,pump,irrigation,contractor,farmer,crops',
      flagged: 0,
    },
    {
      id: 'CH-006', title: 'River bank erosion destroying agricultural land — Sahebganj',
      description: 'The Ganga river bank erosion in Rajmahal block has eaten into 500 acres of agricultural land over 3 years. 120 families have been displaced. Permanent embankment needed. Temporary sand bags wash away every monsoon.',
      domain: 'Environment', district: 'Sahebganj', village: 'Rajmahal',
      submitted_by_id: 'U-CITIZEN-002', submitted_by_name: 'Rajan Hansda',
      submitted_at: '2025-11-05T10:00:00Z', status: 'Resolved',
      endorsements: 67, urgency_score: 84, similar_count: 0,
      assigned_institution_id: 'INST-002', assigned_institution_name: 'IIT (ISM)',
      fit_score: 0.83, lat: 25.24, lng: 87.68,
      ai_category: 'Environment', ai_subcategory: 'Forest & Land', ai_priority: 'High',
      ai_keywords: 'erosion,Ganga,embankment,displacement,agricultural,monsoon',
      validated_at: '2025-11-06T09:00:00Z', validated_by: 'IAS Sanjeev Kumar',
      assigned_at: '2025-11-08T12:00:00Z',
      flagged: 0,
    },
    {
      id: 'CH-007', title: 'Handpump broken in Bero village for drinking water',
      description: 'Our village handpump in Bero has stopped working. We are getting contaminated water from the stream. Please fix the pipe and handpump. Children are getting sick.',
      domain: 'Water', district: 'Ranchi', village: 'Bero',
      submitted_by_id: 'U-CITIZEN-002', submitted_by_name: 'Rajan Hansda',
      submitted_at: '2025-11-16T09:00:00Z', status: 'In Progress',
      endorsements: 22, urgency_score: 80, similar_count: 0,
      assigned_institution_id: 'INST-001', assigned_institution_name: 'BIT Mesra',
      fit_score: 0.91, lat: 23.36, lng: 85.29,
      ai_category: 'Water', ai_subcategory: 'Water Supply', ai_priority: 'High',
      ai_keywords: 'water,handpump,contamination,drinking,children',
      flagged: 0,
    },
    {
      id: 'CH-008', title: 'Fluoride contamination in drinking water — Palamu',
      description: 'Groundwater in Hussainabad block, Palamu shows high fluoride levels (>2.5 mg/L). Dental fluorosis is visible in children. Several adults show signs of skeletal fluorosis. Traditional water sources have been abandoned. Need water treatment plant.',
      domain: 'Water', district: 'Palamu', village: 'Hussainabad',
      submitted_by_id: 'U-CITIZEN-001', submitted_by_name: 'Priya Mahato',
      submitted_at: '2025-10-20T08:00:00Z', status: 'Pending Verification',
      endorsements: 55, urgency_score: 86, similar_count: 0,
      assigned_institution_id: 'INST-001', assigned_institution_name: 'BIT Mesra',
      fit_score: 0.88, lat: 24.54, lng: 84.02,
      ai_category: 'Water', ai_subcategory: 'Water Supply', ai_priority: 'Critical',
      ai_keywords: 'water,fluoride,contamination,disease,treatment',
      validated_at: '2025-10-21T10:00:00Z', validated_by: 'IAS Rekha Devi',
      assigned_at: '2025-10-23T14:00:00Z',
      flagged: 0,
    },
  ]

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO challenges (
      id,title,description,domain,district,village,
      submitted_by_id,submitted_by_name,submitted_at,status,
      endorsements,urgency_score,similar_count,
      assigned_institution_id,assigned_institution_name,fit_score,
      lat,lng,ai_category,ai_subcategory,ai_priority,ai_keywords,
      validated_at,validated_by,assigned_at,flagged,updated_at
    ) VALUES (
      ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
    )
  `)

  for (const c of challenges) {
    stmt.run(
      c.id, c.title, c.description, c.domain, c.district, c.village || null,
      c.submitted_by_id, c.submitted_by_name, c.submitted_at, c.status,
      c.endorsements, c.urgency_score, c.similar_count,
      c.assigned_institution_id || null, c.assigned_institution_name || null, c.fit_score || null,
      c.lat, c.lng, c.ai_category, c.ai_subcategory, c.ai_priority, c.ai_keywords,
      c.validated_at || null, c.validated_by || null, (c as any).assigned_at || null, c.flagged, now()
    )
  }
}

// ──────────────────────────────────────────────────────────────
// DUPLICATE CLUSTERS
// ──────────────────────────────────────────────────────────────
function seedDuplicateClusters(db: ReturnType<typeof getDb>) {
  // CH-001 and CH-007 are duplicates (same village, same domain)
  db.prepare('INSERT OR IGNORE INTO duplicate_clusters (id,primary_challenge_id,district,merged_urgency,merged_endorsements,status) VALUES (?,?,?,?,?,?)').run(
    'CL-001', 'CH-001', 'Ranchi', 92, 69, 'pending'
  )
  db.prepare('INSERT OR IGNORE INTO duplicate_matches (id,cluster_id,challenge_id,similarity_score,title) VALUES (?,?,?,?,?)').run(
    'DM-001', 'CL-001', 'CH-007', 0.84, 'Handpump broken in Bero village for drinking water'
  )
}

// ──────────────────────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────────────────────
function seedProjects(db: ReturnType<typeof getDb>) {
  // Project for CH-001 (Water — BIT Mesra)
  db.prepare(`INSERT OR IGNORE INTO projects (id,challenge_id,title,institution_id,institution_name,industry_partner_id,industry_partner_name,status,start_date,target_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    'PRJ-001', 'CH-001',
    'IoT-Based Smart Water Quality Monitoring for Bero Block',
    'INST-001', 'BIT Mesra',
    'IND-001', 'Tata Projects Ltd.',
    'Active',
    '2025-12-01', '2026-03-31',
    now(), now()
  )

  // Project members for PRJ-001
  const members1 = [
    { id: 'PM-001', project_id: 'PRJ-001', user_id: 'U-FAC-001', name: 'Prof. Suresh Verma', role: 'Faculty Mentor', department: 'Civil Engineering', credit_hours: 0 },
    { id: 'PM-002', project_id: 'PRJ-001', user_id: 'U-STU-001', name: 'Arjun Topno', role: 'Student', department: 'Civil Engineering', credit_hours: 6 },
    { id: 'PM-003', project_id: 'PRJ-001', user_id: 'U-STU-002', name: 'Kavya Soren', role: 'Student', department: 'Computer Science', credit_hours: 5 },
    { id: 'PM-004', project_id: 'PRJ-001', user_id: 'U-IND-001', name: 'Rajesh Tata', role: 'Industry Mentor', department: null, credit_hours: 0 },
  ]
  const memberStmt = db.prepare('INSERT OR IGNORE INTO project_members (id,project_id,user_id,name,role,department,credit_hours) VALUES (?,?,?,?,?,?,?)')
  for (const m of members1) memberStmt.run(m.id, m.project_id, m.user_id, m.name, m.role, m.department, m.credit_hours)

  // Milestones for PRJ-001
  const milestones1 = [
    { id: 'MS-001', project_id: 'PRJ-001', title: 'Site Survey & Water Quality Baseline', description: 'Comprehensive survey of 12 water points in Bero block, baseline testing for pH, TDS, coliform.', due_date: '2025-12-31', completed: 1, completed_date: '2025-12-29', student_hours: 80, rubric_score: 88, faculty_approved: 1, faculty_approved_by: 'Prof. Suresh Verma', faculty_approved_at: '2026-01-02T10:00:00Z' },
    { id: 'MS-002', project_id: 'PRJ-001', title: 'Sensor Design & Prototype Fabrication', description: 'Design and fabricate IoT sensor nodes for real-time water quality monitoring.', due_date: '2026-01-31', completed: 1, completed_date: '2026-01-28', student_hours: 120, rubric_score: 92, faculty_approved: 1, faculty_approved_by: 'Prof. Suresh Verma', faculty_approved_at: '2026-02-01T09:00:00Z' },
    { id: 'MS-003', project_id: 'PRJ-001', title: 'Field Deployment & Testing', description: 'Deploy sensors at 12 locations. Integrate with Jal Jeevan Mission dashboard. Train local operator.', due_date: '2026-02-28', completed: 0, completed_date: null, student_hours: 100, rubric_score: null, faculty_approved: 0, faculty_approved_by: null, faculty_approved_at: null },
    { id: 'MS-004', project_id: 'PRJ-001', title: 'Community Training & Handover', description: 'Train 30 community members on maintenance. Handover to Gram Sabha. Final verification report.', due_date: '2026-03-31', completed: 0, completed_date: null, student_hours: 60, rubric_score: null, faculty_approved: 0, faculty_approved_by: null, faculty_approved_at: null },
  ]
  const msStmt = db.prepare('INSERT OR IGNORE INTO milestones (id,project_id,title,description,due_date,completed,completed_date,student_hours,rubric_score,faculty_approved,faculty_approved_by,faculty_approved_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
  for (const ms of milestones1) msStmt.run(ms.id, ms.project_id, ms.title, ms.description, ms.due_date, ms.completed, ms.completed_date, ms.student_hours, ms.rubric_score, ms.faculty_approved, ms.faculty_approved_by, ms.faculty_approved_at)

  const dlStmt = db.prepare('INSERT OR IGNORE INTO milestone_deliverables (id,milestone_id,title) VALUES (?,?,?)')
  dlStmt.run('DL-001', 'MS-001', 'Survey Report')
  dlStmt.run('DL-002', 'MS-001', 'Water Quality Baseline Map')
  dlStmt.run('DL-003', 'MS-002', 'Sensor Prototype')
  dlStmt.run('DL-004', 'MS-002', 'Technical Specification')
  dlStmt.run('DL-005', 'MS-003', 'Deployed Sensor Network')
  dlStmt.run('DL-006', 'MS-003', 'System Dashboard')
  dlStmt.run('DL-007', 'MS-004', 'Training Manual')
  dlStmt.run('DL-008', 'MS-004', 'Community MOU')

  // Project for CH-006 (Resolved)
  db.prepare(`INSERT OR IGNORE INTO projects (id,challenge_id,title,institution_id,institution_name,industry_partner_id,industry_partner_name,status,start_date,target_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    'PRJ-002', 'CH-006',
    'GIS-Based River Bank Erosion Mapping & Embankment Design — Rajmahal',
    'INST-002', 'IIT (ISM)',
    'IND-002', 'JSW Foundation',
    'Completed',
    '2025-11-10', '2026-01-31',
    now(), now()
  )

  const members2 = [
    { id: 'PM-005', project_id: 'PRJ-002', user_id: 'U-FAC-002', name: 'Prof. Meera Devi', role: 'Faculty Mentor', department: 'Civil Engineering', credit_hours: 0 },
    { id: 'PM-006', project_id: 'PRJ-002', user_id: 'U-STU-003', name: 'Deepak Murmu', role: 'Student', department: 'Remote Sensing & GIS', credit_hours: 8 },
  ]
  for (const m of members2) memberStmt.run(m.id, m.project_id, m.user_id, m.name, m.role, m.department, m.credit_hours)

  const milestones2 = [
    { id: 'MS-005', project_id: 'PRJ-002', title: 'Satellite-based Erosion Assessment', due_date: '2025-11-30', completed: 1, completed_date: '2025-11-28', student_hours: 90, rubric_score: 85, faculty_approved: 1 },
    { id: 'MS-006', project_id: 'PRJ-002', title: 'Embankment Design & DPR', due_date: '2025-12-31', completed: 1, completed_date: '2025-12-29', student_hours: 110, rubric_score: 90, faculty_approved: 1 },
    { id: 'MS-007', project_id: 'PRJ-002', title: 'Community Verification', due_date: '2026-01-15', completed: 1, completed_date: '2026-01-12', student_hours: 40, rubric_score: 95, faculty_approved: 1 },
  ]
  for (const ms of milestones2) {
    db.prepare('INSERT OR IGNORE INTO milestones (id,project_id,title,description,due_date,completed,completed_date,student_hours,rubric_score,faculty_approved) VALUES (?,?,?,?,?,?,?,?,?,?)').run(ms.id, ms.project_id, ms.title, '', ms.due_date, ms.completed, ms.completed_date, ms.student_hours, ms.rubric_score, ms.faculty_approved)
  }

  // Academic credits
  const creditStmt = db.prepare('INSERT OR IGNORE INTO academic_credits (id,student_id,student_name,project_id,milestone_id,hours_logged,credit_points,rubric_score,faculty_verified,faculty_id,faculty_name,verified_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
  creditStmt.run('AC-001', 'U-STU-001', 'Arjun Topno', 'PRJ-001', 'MS-001', 80, 3, 88, 1, 'U-FAC-001', 'Prof. Suresh Verma', now(), now())
  creditStmt.run('AC-002', 'U-STU-002', 'Kavya Soren', 'PRJ-001', 'MS-001', 80, 3, 88, 1, 'U-FAC-001', 'Prof. Suresh Verma', now(), now())
  creditStmt.run('AC-003', 'U-STU-001', 'Arjun Topno', 'PRJ-001', 'MS-002', 120, 4, 92, 1, 'U-FAC-001', 'Prof. Suresh Verma', now(), now())
  creditStmt.run('AC-004', 'U-STU-002', 'Kavya Soren', 'PRJ-001', 'MS-002', 120, 4, 92, 1, 'U-FAC-001', 'Prof. Suresh Verma', now(), now())
  creditStmt.run('AC-005', 'U-STU-003', 'Deepak Murmu', 'PRJ-002', 'MS-005', 90, 3, 85, 1, 'U-FAC-002', 'Prof. Meera Devi', now(), now())
  creditStmt.run('AC-006', 'U-STU-003', 'Deepak Murmu', 'PRJ-002', 'MS-006', 110, 4, 90, 1, 'U-FAC-002', 'Prof. Meera Devi', now(), now())

  // Verification request for CH-008
  db.prepare('INSERT OR IGNORE INTO verification_requests (id,challenge_id,project_id,status) VALUES (?,?,?,?)').run('VR-001', 'CH-008', null, 'pending')
}

// ──────────────────────────────────────────────────────────────
// FUNDING COMMITMENTS
// ──────────────────────────────────────────────────────────────
function seedFundingCommitments(db: ReturnType<typeof getDb>) {
  const stmt = db.prepare('INSERT OR IGNORE INTO funding_commitments (id,challenge_id,project_id,partner_id,partner_name,institution_id,institution_name,amount_lakhs,type,status,disbursed_lakhs,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
  stmt.run('FC-001', 'CH-001', 'PRJ-001', 'IND-001', 'Tata Projects Ltd.', 'INST-001', 'BIT Mesra', 30, 'Co-Development', 'Active', 12.5, now(), now())
  stmt.run('FC-002', 'CH-006', 'PRJ-002', 'IND-002', 'JSW Foundation', 'INST-002', 'IIT (ISM)', 50, 'CSR', 'Disbursed', 50, now(), now())
  stmt.run('FC-003', 'CH-002', null, 'IND-001', 'Tata Projects Ltd.', 'INST-003', 'NIT Jamshedpur', 75, 'Co-Development', 'Active', 0, now(), now())
}

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────────
function seedNotifications(db: ReturnType<typeof getDb>) {
  const notifs = [
    { id: 'NT-001', recipient_id: 'U-CITIZEN-001', type: 'assigned', title: 'Challenge Assigned to BIT Mesra', body: 'Your challenge "Handpump failure causing water scarcity in Bero block" has been assigned to BIT Mesra for resolution.', read: 1, related_challenge_id: 'CH-001' },
    { id: 'NT-002', recipient_id: 'U-GOV-001', type: 'new_submission', title: 'New Challenge: Handpump failure in Bero', body: 'Challenge CH-001 has been submitted and requires review.', read: 1, related_challenge_id: 'CH-001' },
    { id: 'NT-003', recipient_id: 'U-UNI-001', type: 'assigned', title: 'New Challenge Assignment: Water crisis in Bero', body: 'Challenge CH-001 has been routed to BIT Mesra. Please review and accept.', read: 0, related_challenge_id: 'CH-001' },
    { id: 'NT-004', recipient_id: 'U-CITIZEN-001', type: 'milestone_complete', title: 'Milestone Completed: Site Survey', body: 'The "Site Survey & Water Quality Baseline" milestone for your challenge project has been completed.', read: 0, related_challenge_id: 'CH-001' },
    { id: 'NT-005', recipient_id: 'U-GOV-001', type: 'new_submission', title: 'New Challenge: Road connectivity in Simdega', body: 'Challenge CH-002 requires urgent review. Urgency score: 92.', read: 0, related_challenge_id: 'CH-002' },
    { id: 'NT-006', recipient_id: 'U-CITIZEN-004', type: 'new_submission', title: 'Challenge Received', body: 'Your challenge "Primary Health Centre non-functional" (CH-004) has been received and is under review.', read: 1, related_challenge_id: 'CH-004' },
    { id: 'NT-007', recipient_id: 'U-GOV-002', type: 'verification_requested', title: 'Verification Required: Fluoride Contamination', body: 'Challenge CH-008 has been resolved and is awaiting verification from the citizen reporter.', read: 0, related_challenge_id: 'CH-008' },
    { id: 'NT-008', recipient_id: 'U-CITIZEN-002', type: 'resolved', title: 'Challenge Resolved!', body: 'Your challenge "River bank erosion" has been resolved. Thank you for making Jharkhand better!', read: 1, related_challenge_id: 'CH-006' },
  ]

  const stmt = db.prepare('INSERT OR IGNORE INTO notifications (id,recipient_id,type,title,body,read,channel,delivery_status,related_challenge_id,related_project_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
  for (const n of notifs) {
    stmt.run(n.id, n.recipient_id, n.type, n.title, n.body, n.read, 'in_app', 'delivered', n.related_challenge_id || null, null, now())
  }
}

// ──────────────────────────────────────────────────────────────
// IP DECLARATIONS
// ──────────────────────────────────────────────────────────────
function seedIPDeclarations(db: ReturnType<typeof getDb>) {
  const stmt = db.prepare('INSERT OR IGNORE INTO ip_declarations (id,project_id,title,type,inventors,filing_date,status) VALUES (?,?,?,?,?,?,?)')
  stmt.run('IP-001', 'PRJ-001', 'IoT Sensor Array for Low-Cost Multi-Parameter Water Quality Monitoring', 'Patent', 'Arjun Topno, Kavya Soren, Prof. Suresh Verma', '2026-01-15', 'filed')
  stmt.run('IP-002', 'PRJ-002', 'Predictive GIS Model for River Bank Erosion in Eastern Jharkhand', 'Copyright', 'Deepak Murmu, Prof. Meera Devi', '2026-01-05', 'published')
}

// Self-executing when run directly
if (require.main === module) {
  seed()
}
