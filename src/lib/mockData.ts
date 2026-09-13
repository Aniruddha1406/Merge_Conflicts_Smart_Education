// Central mock data store for the Societal Innovation Collaboration Portal
// All data is fictional and for demonstration purposes only.

export type SubmissionStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned to Institution'
  | 'In Progress'
  | 'Pending Verification'
  | 'Resolved'

export type Domain =
  | 'Education'
  | 'Healthcare'
  | 'Agriculture'
  | 'Water & Sanitation'
  | 'Environment'
  | 'Rural Livelihoods'
  | 'Accessibility'
  | 'Urban Infrastructure'
  | 'Public Service Delivery'

export interface Submission {
  id: string
  title: string
  description: string
  domain: Domain
  district: string
  village?: string
  submittedBy: string
  submittedAt: string
  status: SubmissionStatus
  endorsements: number
  media: string[]
  lat: number
  lng: number
  urgencyScore: number
  similarCount: number
  assignedInstitution?: string
  fitScore?: number
}

export interface Institution {
  id: string
  name: string
  shortName: string
  type: 'University' | 'IIT' | 'NIT' | 'College'
  location: string
  departments: string[]
  expertiseTags: string[]
  incubationCenter: boolean
  activeProjects: number
}

export interface Project {
  id: string
  submissionId: string
  title: string
  institution: string
  industryPartner?: string
  status: 'Planning' | 'Active' | 'Testing' | 'Completed' | 'Stalled'
  startDate: string
  targetDate: string
  milestones: Milestone[]
  team: TeamMember[]
  verificationEvidence?: VerificationEvidence
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  completedDate?: string
  studentHours: number
  rubricScore?: number
  deliverables: string[]
}

export interface TeamMember {
  id: string
  name: string
  role: 'Faculty Mentor' | 'Student' | 'Industry Mentor'
  department: string
  creditHours?: number
}

export interface VerificationEvidence {
  submittedAt: string
  photoUrl: string
  lat: number
  lng: number
  confirmedByReporter: boolean
  adminVerified: boolean
}

export interface IndustryPartner {
  id: string
  name: string
  sector: string
  capabilities: string[]
  csrFocusAreas: Domain[]
  activeCommitments: number
  totalFundingCrore: number
}

export interface DuplicateCluster {
  primaryId: string
  relatedIds: string[]
  similarityScores: { id: string; score: number; title: string }[]
  mergedUrgency: number
  mergedEndorsements: number
  lat: number
  lng: number
  district: string
}

// ============================================================
// MOCK SUBMISSIONS
// ============================================================
export const SUBMISSIONS: Submission[] = [
  {
    id: 'SUB-001',
    title: 'Graphene-Oxide Nanomembrane Filtration for Industrial Runoff',
    description: 'Developing a low-cost, scalable nanomembrane to filter heavy metals (arsenic/fluoride) from coal washery effluents in Ramgarh. Current RO systems are too power-intensive for rural deployment.',
    domain: 'Water & Sanitation',
    district: 'Latehar',
    village: 'Barwadih',
    submittedBy: 'Jal Shakti Vibhag',
    submittedAt: '2026-07-14T09:22:00Z',
    status: 'Pending Verification',
    endorsements: 47,
    media: [],
    lat: 23.8,
    lng: 84.07,
    urgencyScore: 91,
    similarCount: 3,
    assignedInstitution: 'BIT Mesra',
    fitScore: 0.87,
  },
  {
    id: 'SUB-002',
    title: 'Non-Invasive Optical Sensor for Sickle Cell Anemia',
    description: 'Building a portable, AI-driven optical screening device for early detection of sickle cell traits in tribal populations in Khunti. Existing blood-based diagnostics require cold-chain logistics which fail in remote areas.',
    domain: 'Healthcare',
    district: 'Khunti',
    submittedBy: 'District Health Officer',
    submittedAt: '2026-07-28T11:00:00Z',
    status: 'In Progress',
    endorsements: 82,
    media: [],
    lat: 23.07,
    lng: 85.28,
    urgencyScore: 95,
    similarCount: 1,
    assignedInstitution: 'RIMS Ranchi',
    fitScore: 0.93,
  },
  {
    id: 'SUB-003',
    title: 'Drought-Resistant Bio-fortified Rice via CRISPR',
    description: 'Targeted mutagenesis of indigenous Jharkhand rice varieties to improve drought tolerance and iron/zinc bio-availability, combating malnutrition in Gumla district.',
    domain: 'Agriculture',
    district: 'Gumla',
    submittedBy: 'Krishi Vigyan Kendra',
    submittedAt: '2026-08-03T08:15:00Z',
    status: 'Assigned to Institution',
    endorsements: 63,
    media: [],
    lat: 23.05,
    lng: 84.53,
    urgencyScore: 78,
    similarCount: 2,
    assignedInstitution: 'BIT Mesra',
    fitScore: 0.81,
  },
  {
    id: 'SUB-004',
    title: 'AI-Driven Adaptive Learning System for Low-Resource Santhali Schools',
    description: 'Creating an edge-AI powered adaptive learning tablet software that works entirely offline, localized in Santhali language, to combat high dropout rates in Simdega.',
    domain: 'Education',
    district: 'Simdega',
    submittedBy: 'District Education Officer',
    submittedAt: '2026-08-10T13:45:00Z',
    status: 'Under Review',
    endorsements: 34,
    media: [],
    lat: 22.61,
    lng: 84.51,
    urgencyScore: 70,
    similarCount: 0,
  },
  {
    id: 'SUB-005',
    title: 'Edge-AI Predictive Maintenance for Rural Solar Micro-Grids',
    description: 'Deploying IoT-enabled edge-AI controllers on rural solar micro-grids in Hatia to predict battery and inverter failures before they occur, ensuring uninterrupted power.',
    domain: 'Urban Infrastructure',
    district: 'Ranchi',
    village: 'Hatia',
    submittedBy: 'JREDA',
    submittedAt: '2026-08-18T07:30:00Z',
    status: 'Submitted',
    endorsements: 21,
    media: [],
    lat: 23.31,
    lng: 85.28,
    urgencyScore: 83,
    similarCount: 1,
  },
  {
    id: 'SUB-006',
    title: 'Distributed Acoustic IoT Sensors for Illegal Logging Detection',
    description: 'Deploying a mesh network of edge-AI acoustic sensors to detect and triangulate chainsaw frequencies in the Saranda forest, triggering real-time alerts to forest rangers.',
    domain: 'Environment',
    district: 'West Singhbhum',
    submittedBy: 'Department of Forest & Climate Change',
    submittedAt: '2026-08-22T10:00:00Z',
    status: 'In Progress',
    endorsements: 108,
    media: [],
    lat: 22.3,
    lng: 85.1,
    urgencyScore: 88,
    similarCount: 0,
    assignedInstitution: 'IIT (ISM) Dhanbad',
    fitScore: 0.79,
  },
  {
    id: 'SUB-007',
    title: 'Brain-Computer Interface (BCI) Motorized Wheelchair Control',
    description: 'Developing an affordable EEG-based navigation system for patients with severe motor neuron diseases (ALS/Quadriplegia) who cannot use traditional joystick wheelchairs.',
    domain: 'Accessibility',
    district: 'Dhanbad',
    submittedBy: 'Divyang Samman Sangh',
    submittedAt: '2026-09-01T09:00:00Z',
    status: 'Assigned to Institution',
    endorsements: 19,
    media: [],
    lat: 23.79,
    lng: 86.43,
    urgencyScore: 65,
    similarCount: 0,
    assignedInstitution: 'NIT Jamshedpur',
    fitScore: 0.84,
  },
  {
    id: 'SUB-008',
    title: 'Bio-remediation of Arsenic-contaminated Groundwater using Algal Mats',
    description: 'Designing genetically engineered algal mats for rapid bio-remediation of heavy metal contamination in coal mining areas of Ramgarh.',
    domain: 'Water & Sanitation',
    district: 'Ramgarh',
    submittedBy: 'Jal Panchayat Ramgarh',
    submittedAt: '2026-09-05T06:00:00Z',
    status: 'Under Review',
    endorsements: 55,
    media: [],
    lat: 23.63,
    lng: 85.52,
    urgencyScore: 89,
    similarCount: 2,
  },
  {
    id: 'SUB-009',
    title: 'Blockchain Traceability for Non-Timber Forest Products (NTFP)',
    description: 'Creating a blockchain-based supply chain ledger to ensure fair pricing and provenance tracking for tribal tendu leaf and lac collectors in Palamu.',
    domain: 'Rural Livelihoods',
    district: 'Palamu',
    village: 'Medininagar',
    submittedBy: 'JHAMFCO',
    submittedAt: '2026-08-27T07:00:00Z',
    status: 'Submitted',
    endorsements: 74,
    media: [],
    lat: 24.05,
    lng: 84.07,
    urgencyScore: 80,
    similarCount: 0,
  },
  {
    id: 'SUB-010',
    title: 'NLP-Based E-Governance Kiosk for Munda & Ho Languages',
    description: 'Developing an offline Natural Language Processing engine capable of understanding Munda and Ho languages for voice-activated e-District certificate generation.',
    domain: 'Public Service Delivery',
    district: 'Bokaro',
    submittedBy: 'Department of IT & e-Governance',
    submittedAt: '2026-09-02T11:30:00Z',
    status: 'Under Review',
    endorsements: 38,
    media: [],
    lat: 23.67,
    lng: 85.98,
    urgencyScore: 72,
    similarCount: 1,
  },
  {
    id: 'SUB-011',
    title: 'Self-Healing Bio-Concrete using Industrial Fly Ash',
    description: 'Formulating a sustainable, bacteria-infused concrete mix utilizing local steel plant fly-ash that automatically seals micro-cracks to increase urban infrastructure lifespan in Jamshedpur.',
    domain: 'Urban Infrastructure',
    district: 'East Singhbhum',
    village: 'Jamshedpur',
    submittedBy: 'JUSCO',
    submittedAt: '2026-09-07T09:45:00Z',
    status: 'Submitted',
    endorsements: 29,
    media: [],
    lat: 22.8,
    lng: 86.18,
    urgencyScore: 68,
    similarCount: 0,
  },
  {
    id: 'SUB-012',
    title: 'AR-Based Vocational Training Simulators for ITI Students',
    description: 'Building low-cost Augmented Reality (AR) headsets and software modules for welding and CNC machining simulations, removing the need for expensive physical raw materials in tribal ITIs.',
    domain: 'Education',
    district: 'Godda',
    submittedBy: 'Directorate of Employment & Training',
    submittedAt: '2026-09-09T08:00:00Z',
    status: 'Submitted',
    endorsements: 91,
    media: [],
    lat: 24.83,
    lng: 87.21,
    urgencyScore: 86,
    similarCount: 0,
  }
]

// ============================================================
// INSTITUTIONS
// ============================================================
export const INSTITUTIONS: Institution[] = [
  {
    id: 'INST-001',
    name: 'Birla Institute of Technology, Mesra',
    shortName: 'BIT Mesra',
    type: 'University',
    location: 'Ranchi, Jharkhand',
    departments: [
      'Civil Engineering',
      'Environmental Engineering',
      'Agriculture & Food Engineering',
      'Information Technology',
      'Biotechnology',
    ],
    expertiseTags: [
      'Nanomaterials',
      'Water Treatment',
      'CRISPR & Plant Biotech',
      'Precision Agriculture',
      'IoT for Rural',
    ],
    incubationCenter: true,
    activeProjects: 7,
  },
  {
    id: 'INST-002',
    name: 'Indian Institute of Technology (ISM) Dhanbad',
    shortName: 'IIT (ISM) Dhanbad',
    type: 'IIT',
    location: 'Dhanbad, Jharkhand',
    departments: [
      'Mining Engineering',
      'Environmental Science',
      'Computer Science',
      'Chemical Engineering',
      'Management Studies',
    ],
    expertiseTags: [
      'Mine Reclamation',
      'Acoustic Sensing',
      'Edge AI',
      'AR/VR Systems',
      'Effluent Treatment',
    ],
    incubationCenter: true,
    activeProjects: 11,
  },
  {
    id: 'INST-003',
    name: 'National Institute of Technology Jamshedpur',
    shortName: 'NIT Jamshedpur',
    type: 'NIT',
    location: 'Jamshedpur, Jharkhand',
    departments: [
      'Civil Engineering',
      'Architecture',
      'Mechanical Engineering',
      'Electronics',
      'Production Engineering',
    ],
    expertiseTags: [
      'BCI & Neural Engineering',
      'Smart Materials',
      'Universal Design',
      'Structural Engineering',
      'Embedded Systems',
    ],
    incubationCenter: true,
    activeProjects: 5,
  },
  {
    id: 'INST-004',
    name: 'Rajendra Institute of Medical Sciences',
    shortName: 'RIMS Ranchi',
    type: 'University',
    location: 'Ranchi, Jharkhand',
    departments: [
      'Public Health',
      'Pathology',
      'Community Medicine',
      'Nursing',
    ],
    expertiseTags: [
      'Optical Diagnostics',
      'Tribal Health',
      'Telemedicine',
      'Community Nutrition',
      'Epidemiology',
    ],
    incubationCenter: false,
    activeProjects: 4,
  },
]

// ============================================================
// PROJECTS
// ============================================================
export const PROJECTS: Project[] = [
  {
    id: 'PRJ-001',
    submissionId: 'SUB-001',
    title: 'Graphene-Oxide Nanomembrane Prototype for Heavy Metal Filtration',
    institution: 'BIT Mesra',
    industryPartner: 'Tata Projects CSR',
    status: 'Active',
    startDate: '2026-08-01',
    targetDate: '2026-12-31',
    milestones: [
      {
        id: 'MS-001-1',
        title: 'Material Synthesis & Characterization',
        description: 'Synthesize GO nanoparticles and characterize using SEM/XRD.',
        dueDate: '2026-08-31',
        completed: true,
        completedDate: '2026-08-28',
        studentHours: 120,
        rubricScore: 88,
        deliverables: ['Synthesis Protocol', 'SEM Analysis Report'],
      },
      {
        id: 'MS-001-2',
        title: 'Membrane Fabrication & Lab Testing',
        description: 'Fabricate composite membranes and test flux/rejection rates against arsenic.',
        dueDate: '2026-09-30',
        completed: false,
        studentHours: 0,
        deliverables: ['Fabricated Membranes', 'Lab Test Results'],
      },
      {
        id: 'MS-001-3',
        title: 'Field Pilot Deployment',
        description: 'Deploy 5 prototype units in Ramgarh coal washery runoff zones.',
        dueDate: '2026-11-30',
        completed: false,
        studentHours: 0,
        deliverables: ['Installation Report', 'Field Water Quality Data'],
      },
      {
        id: 'MS-001-4',
        title: 'Patent Filing & Verification',
        description: 'File utility patent and obtain verification from Jal Shakti Vibhag.',
        dueDate: '2026-12-31',
        completed: false,
        studentHours: 0,
        deliverables: ['Patent Application', 'Verification Document'],
      },
    ],
    team: [
      {
        id: 'TM-001',
        name: 'Prof. Anita Sharma',
        role: 'Faculty Mentor',
        department: 'Environmental Engineering',
      },
      {
        id: 'TM-002',
        name: 'Ravi Kumar (PhD)',
        role: 'Student',
        department: 'Chemical Engineering',
        creditHours: 8,
      },
      {
        id: 'TM-003',
        name: 'Priya Ekka (M.Tech II)',
        role: 'Student',
        department: 'Environmental Engineering',
        creditHours: 8,
      },
      {
        id: 'TM-004',
        name: 'Deepak Nath (B.Tech IV)',
        role: 'Student',
        department: 'Civil Engineering',
        creditHours: 4,
      },
    ],
    verificationEvidence: undefined,
  },
  {
    id: 'PRJ-002',
    submissionId: 'SUB-002',
    title: 'Optical Spectrometry Device for Sickle Cell Detection',
    institution: 'RIMS Ranchi',
    industryPartner: 'Wipro Foundation',
    status: 'Active',
    startDate: '2026-08-15',
    targetDate: '2027-02-28',
    milestones: [
      {
        id: 'MS-002-1',
        title: 'Optics & Sensor Calibration',
        description: 'Calibrate IR/UV sensors against standard hemoglobin samples.',
        dueDate: '2026-08-31',
        completed: true,
        completedDate: '2026-08-30',
        studentHours: 80,
        rubricScore: 91,
        deliverables: ['Calibration Log', 'Sensor Design Schematic'],
      },
      {
        id: 'MS-002-2',
        title: 'Embedded AI Model Training',
        description: 'Train edge-AI classification model using existing clinical datasets.',
        dueDate: '2026-09-30',
        completed: true,
        completedDate: '2026-09-10',
        studentHours: 60,
        rubricScore: 85,
        deliverables: ['Model Weights', 'Accuracy Report'],
      },
      {
        id: 'MS-002-3',
        title: 'Clinical Trials (Phase 1)',
        description: 'Test prototype on 200 subjects in Khunti PHC under ethical guidelines.',
        dueDate: '2026-11-30',
        completed: false,
        studentHours: 0,
        deliverables: ['Clinical Trial Report', 'Ethical Clearance'],
      },
    ],
    team: [
      {
        id: 'TM-005',
        name: 'Dr. Meena Toppo',
        role: 'Faculty Mentor',
        department: 'Community Medicine',
      },
      {
        id: 'TM-006',
        name: 'Sita Minj (MD Resident)',
        role: 'Student',
        department: 'Pathology',
        creditHours: 6,
      },
    ],
  },
  {
    id: 'PRJ-003',
    submissionId: 'SUB-003',
    title: 'CRISPR-Cas9 Mutagenesis of Indigenous Rice (Drought Tolerance)',
    institution: 'BIT Mesra',
    industryPartner: 'AgriSpark Innovations Pvt. Ltd.',
    status: 'Stalled',
    startDate: '2026-07-01',
    targetDate: '2026-11-30',
    milestones: [
      {
        id: 'MS-003-1',
        title: 'sgRNA Design & Vector Construction',
        description: 'Design guide RNAs targeting OsDRO1 gene and assemble CRISPR vectors.',
        dueDate: '2026-07-31',
        completed: true,
        completedDate: '2026-07-29',
        studentHours: 90,
        rubricScore: 82,
        deliverables: ['Vector Map', 'Sequencing Data'],
      },
      {
        id: 'MS-003-2',
        title: 'Agrobacterium-mediated Transformation',
        description: 'Transform calli of Gora rice variety and regenerate plantlets.',
        dueDate: '2026-08-31',
        completed: false,
        studentHours: 0,
        deliverables: ['Transgenic Plantlets', 'PCR Validation'],
      },
      {
        id: 'MS-003-3',
        title: 'Greenhouse Drought Stress Assays',
        description: 'Subject T0 generation to drought stress and measure physiological response.',
        dueDate: '2026-11-30',
        completed: false,
        studentHours: 0,
        deliverables: ['Stress Assay Data', 'Phenotypic Report'],
      },
    ],
    team: [
      { id: 'TM-007', name: 'Prof. R.K. Singh', role: 'Faculty Mentor', department: 'Biotechnology' },
      { id: 'TM-008', name: 'Kavita Singh (PhD)', role: 'Student', department: 'Plant Biotechnology', creditHours: 4 },
    ],
  },
  {
    id: 'PRJ-004',
    submissionId: 'SUB-007',
    title: 'Affordable EEG-based Motorized Wheelchair BCI System',
    institution: 'NIT Jamshedpur',
    industryPartner: undefined,
    status: 'Completed',
    startDate: '2026-06-01',
    targetDate: '2026-09-01',
    milestones: [
      {
        id: 'MS-004-1',
        title: 'Signal Processing Pipeline',
        description: 'Develop Python pipeline to filter raw EEG data and extract motor-imagery features.',
        dueDate: '2026-06-30',
        completed: true,
        completedDate: '2026-06-28',
        studentHours: 60,
        rubricScore: 90,
        deliverables: ['Python Repository', 'Feature Extraction Log'],
      },
      {
        id: 'MS-004-2',
        title: 'Wheelchair Motor Integration',
        description: 'Interface BCI output with Arduino-based motor controllers on standard wheelchair.',
        dueDate: '2026-07-31',
        completed: true,
        completedDate: '2026-07-25',
        studentHours: 80,
        rubricScore: 88,
        deliverables: ['Hardware Prototype', 'Circuit Schematics'],
      },
      {
        id: 'MS-004-3',
        title: 'User Testing & Certification',
        description: 'Test prototype with 5 ALS patients and obtain safety certification.',
        dueDate: '2026-09-01',
        completed: true,
        completedDate: '2026-09-01',
        studentHours: 40,
        rubricScore: 95,
        deliverables: ['User Testing Video', 'Safety Certification'],
      },
    ],
    team: [
      { id: 'TM-009', name: 'Dr. S.K. Verma', role: 'Faculty Mentor', department: 'Electronics Engineering' },
      { id: 'TM-010', name: 'Arjun Munda (B.Tech III)', role: 'Student', department: 'Electronics Engineering', creditHours: 6 },
    ],
    verificationEvidence: {
      submittedAt: '2026-09-02T10:00:00Z',
      photoUrl: '',
      lat: 23.79,
      lng: 86.43,
      confirmedByReporter: true,
      adminVerified: true,
    },
  },
  {
    id: 'PRJ-005',
    submissionId: 'SUB-012',
    title: 'AR Welding & CNC Simulator Software for ITIs',
    institution: 'IIT (ISM) Dhanbad',
    industryPartner: 'Wipro Foundation',
    status: 'Planning',
    startDate: '2026-10-01',
    targetDate: '2027-03-31',
    milestones: [
      {
        id: 'MS-005-1',
        title: '3D Asset Creation & Physics Engine setup',
        description: 'Model welding tools and implement basic physics/sparks in Unity3D.',
        dueDate: '2026-10-31',
        completed: false,
        studentHours: 0,
        deliverables: ['3D Models', 'Unity Project Scaffold'],
      },
      {
        id: 'MS-005-2',
        title: 'AR Headset Integration (Quest 3)',
        description: 'Port simulator to standalone VR/AR headsets with hand tracking.',
        dueDate: '2027-01-31',
        completed: false,
        studentHours: 0,
        deliverables: ['APK Build', 'Hand Tracking Module'],
      },
      {
        id: 'MS-005-3',
        title: 'ITI Pilot Deployment',
        description: 'Deploy in 2 Godda ITIs and measure skill acquisition vs traditional methods.',
        dueDate: '2027-03-31',
        completed: false,
        studentHours: 0,
        deliverables: ['Impact Report', 'Skill Assessment Data'],
      },
    ],
    team: [
      { id: 'TM-011', name: 'Prof. Anita Sharma', role: 'Faculty Mentor', department: 'Computer Science' },
      { id: 'TM-012', name: 'Suresh Hembrom (M.Tech II)', role: 'Student', department: 'Computer Science', creditHours: 0 },
    ],
  },
]

// ============================================================
// INDUSTRY PARTNERS
// ============================================================
export const INDUSTRY_PARTNERS: IndustryPartner[] = [
  {
    id: 'IND-001',
    name: 'Tata Projects (CSR Division)',
    sector: 'Infrastructure & Construction',
    capabilities: ['Project Management', 'Civil Works', 'Community Engagement'],
    csrFocusAreas: ['Water & Sanitation', 'Rural Livelihoods', 'Education'],
    activeCommitments: 3,
    totalFundingCrore: 4.5,
  },
  {
    id: 'IND-002',
    name: 'Wipro Foundation',
    sector: 'Technology & Healthcare',
    capabilities: ['Digital Systems', 'Healthcare IT', 'Capacity Building'],
    csrFocusAreas: ['Healthcare', 'Education', 'Accessibility'],
    activeCommitments: 2,
    totalFundingCrore: 2.8,
  },
  {
    id: 'IND-003',
    name: 'SAIL (CSR)',
    sector: 'Steel & Mining',
    capabilities: ['Manufacturing', 'Environmental Management', 'Skill Training'],
    csrFocusAreas: ['Environment', 'Rural Livelihoods', 'Urban Infrastructure'],
    activeCommitments: 4,
    totalFundingCrore: 8.2,
  },
  {
    id: 'IND-004',
    name: 'AgriSpark Innovations Pvt. Ltd.',
    sector: 'AgriTech Startup',
    capabilities: ['Soil Analytics', 'Precision Farming', 'Drone Monitoring'],
    csrFocusAreas: ['Agriculture', 'Environment'],
    activeCommitments: 1,
    totalFundingCrore: 0.6,
  },
]

// ============================================================
// DUPLICATE / SIMILARITY CLUSTERS (for admin deduplication panel)
// ============================================================
export const DUPLICATE_CLUSTERS: DuplicateCluster[] = [
  {
    primaryId: 'SUB-001',
    relatedIds: ['SUB-001-SIM-A', 'SUB-001-SIM-B', 'SUB-001-SIM-C'],
    similarityScores: [
      {
        id: 'SUB-001-SIM-A',
        score: 0.94,
        title: 'Broken handpump in Mahuadanr village (Latehar)',
      },
      {
        id: 'SUB-001-SIM-B',
        score: 0.87,
        title: 'Water crisis due to pump failure across Barwadih panchayat',
      },
      {
        id: 'SUB-001-SIM-C',
        score: 0.79,
        title: 'No drinking water available in 3 hamlets near Barwadih',
      },
    ],
    mergedUrgency: 91,
    mergedEndorsements: 47 + 22 + 18 + 9,
    lat: 23.8,
    lng: 84.07,
    district: 'Latehar',
  },
  {
    primaryId: 'SUB-005',
    relatedIds: ['SUB-005-SIM-A'],
    similarityScores: [
      {
        id: 'SUB-005-SIM-A',
        score: 0.82,
        title: 'Mosquito breeding in stagnant water near Kokar drain',
      },
    ],
    mergedUrgency: 83,
    mergedEndorsements: 21 + 14,
    lat: 23.33,
    lng: 85.31,
    district: 'Ranchi',
  },
]

// ============================================================
// ANALYTICS / DASHBOARD STATS
// ============================================================
export const DASHBOARD_STATS = {
  totalSubmissions: 1247,
  resolvedSubmissions: 312,
  institutionsEngaged: 18,
  industryPartners: 34,
  projectsActive: 47,
  projectsCompleted: 28,
  creditsAwarded: 2340,
  patentsFiled: 6,
  startupsSpawned: 4,
  districtsCovered: 24,
  resolutionRate: 25.0,
  avgTimeToAssign: 4.2,
  fundingCommittedCrore: 18.4,
  communityDeployments: 31,
  submissionsByDomain: [
    { domain: 'Water & Sanitation', count: 284 },
    { domain: 'Healthcare', count: 198 },
    { domain: 'Agriculture', count: 176 },
    { domain: 'Education', count: 152 },
    { domain: 'Environment', count: 134 },
    { domain: 'Rural Livelihoods', count: 112 },
    { domain: 'Urban Infrastructure', count: 98 },
    { domain: 'Accessibility', count: 63 },
    { domain: 'Public Service Delivery', count: 30 },
  ],
  submissionsByDistrict: [
    { district: 'Ranchi', count: 187 },
    { district: 'Dhanbad', count: 143 },
    { district: 'Latehar', count: 98 },
    { district: 'Gumla', count: 87 },
    { district: 'Khunti', count: 76 },
    { district: 'West Singhbhum', count: 71 },
    { district: 'Ramgarh', count: 64 },
    { district: 'Simdega', count: 58 },
    { district: 'Giridih', count: 52 },
    { district: 'Hazaribagh', count: 49 },
  ],
  monthlyTrend: [
    { month: 'Oct', submissions: 38, resolved: 6 },
    { month: 'Nov', submissions: 52, resolved: 9 },
    { month: 'Dec', submissions: 41, resolved: 11 },
    { month: 'Jan', submissions: 67, resolved: 14 },
    { month: 'Feb', submissions: 74, resolved: 16 },
    { month: 'Mar', submissions: 64, resolved: 12 },
    { month: 'Apr', submissions: 87, resolved: 18 },
    { month: 'May', submissions: 102, resolved: 24 },
    { month: 'Jun', submissions: 128, resolved: 31 },
    { month: 'Jul', submissions: 156, resolved: 42 },
    { month: 'Aug', submissions: 183, resolved: 58 },
    { month: 'Sep', submissions: 147, resolved: 47 },
  ],
}

// ============================================================
// OUTCOME METRICS
// ============================================================
export const OUTCOME_METRICS = {
  patentsFiled: 6,
  patentsPending: 4,
  startupsSpawned: 4,
  ipsDeclared: 11,
  communityDeployments: 31,
  statesReplicating: 2,
  researchPapersPublished: 14,
  csrFundingCrore: 18.4,
}

// ============================================================
// ROUTING RECOMMENDATIONS (AI Fit Scores)
// ============================================================
export const ROUTING_RECOMMENDATIONS: Record<
  string,
  { institution: Institution; fitScore: number; matchBasis: string[] }[]
> = {
  'SUB-004': [
    {
      institution: INSTITUTIONS[0], // BIT Mesra
      fitScore: 0.88,
      matchBasis: ['Department: Information Technology', 'Expertise: IoT for Rural', 'Active Incubation Center'],
    },
    {
      institution: INSTITUTIONS[1], // IIT (ISM)
      fitScore: 0.76,
      matchBasis: ['Expertise: AI & ML', 'Active Incubation Center', 'Department: Computer Science'],
    },
    {
      institution: INSTITUTIONS[2], // NIT Jamshedpur
      fitScore: 0.61,
      matchBasis: ['Department: Electronics', 'Expertise: Smart City'],
    },
  ],
  'SUB-008': [
    {
      institution: INSTITUTIONS[0], // BIT Mesra
      fitScore: 0.92,
      matchBasis: ['Expertise: Water Treatment', 'Department: Environmental Engineering', 'Active Incubation Center'],
    },
    {
      institution: INSTITUTIONS[1], // IIT (ISM)
      fitScore: 0.85,
      matchBasis: ['Expertise: Effluent Treatment', 'Department: Chemical Engineering', 'Department: Environmental Science'],
    },
    {
      institution: INSTITUTIONS[2], // NIT Jamshedpur
      fitScore: 0.58,
      matchBasis: ['Department: Civil Engineering', 'Expertise: Public Health Engineering'],
    },
  ],
}

// ============================================================
// VOICE SUBMISSION — simulated AI output
// ============================================================
export const VOICE_SUBMISSION_DEMO = {
  audioPlaceholder: true,
  languages: [
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'sat', label: 'Santhali', nativeLabel: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'ho', label: 'Ho', nativeLabel: 'हो' },
    { code: 'mun', label: 'Mundari', nativeLabel: 'मुंडारी' },
  ],
  mockTranscription: {
    raw: 'हमारे गांव में पानी का कोई साधन नहीं है। हैंडपंप तीन महीने से खराब है। बच्चे और औरतें दूर से पानी लाती हैं।',
    translated:
      'There is no water source in our village. The hand pump has been broken for three months. Children and women fetch water from far away.',
    structuredOutput: {
      title: 'Non-functional hand pump — drinking water crisis',
      description:
        'The community hand pump in the village has been broken for the last 3 months. Women and children are walking long distances to fetch water from an unprotected source, posing serious health risks.',
      category: 'Water & Sanitation' as Domain,
      location: 'Auto-detected via GPS',
      urgency: 'High',
    },
  },
}
