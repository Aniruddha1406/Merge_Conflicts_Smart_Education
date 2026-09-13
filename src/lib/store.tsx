'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react'
import {
  SUBMISSIONS,
  PROJECTS,
  DUPLICATE_CLUSTERS,
  Submission,
  Project,
  DuplicateCluster,
  SubmissionStatus,
} from './mockData'

// ─── Notification type ────────────────────────────────────────────────────────
export type NotificationType =
  | 'new_submission'
  | 'assigned'
  | 'milestone_complete'
  | 'verification_requested'
  | 'merged'
  | 'resolved'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  read: boolean
}

// ─── Commitment type ──────────────────────────────────────────────────────────
export interface FundingCommitment {
  id: string
  submissionId: string
  submissionTitle: string
  institution: string
  partnerId: string
  amountLakhs: number
  type: 'CSR' | 'Seed Grant' | 'Co-Development'
  status: 'Active' | 'Disbursed' | 'Pending'
  disbursedLakhs: number
}

// ─── State shape ──────────────────────────────────────────────────────────────
export interface AppState {
  submissions: Submission[]
  projects: Project[]
  clusters: DuplicateCluster[]
  notifications: AppNotification[]
  commitments: FundingCommitment[]
  mergedClusterIds: string[]  // primary IDs that have been merged
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ENDORSE'; submissionId: string }
  | { type: 'SET_STATUS'; submissionId: string; status: SubmissionStatus }
  | { type: 'ASSIGN'; submissionId: string; institution: string; fitScore: number }
  | { type: 'MERGE_CLUSTER'; primaryId: string }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'COMPLETE_MILESTONE'; projectId: string; milestoneId: string; rubricScore: number }
  | { type: 'ADD_COMMITMENT'; commitment: FundingCommitment }
  | { type: 'SUBMIT_VERIFICATION'; submissionId: string }
  | { type: 'ADD_MILESTONE'; projectId: string; milestone: any }

// ─── Seed notifications ───────────────────────────────────────────────────────
const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'N-001',
    type: 'new_submission',
    title: 'New submission in Ramgarh',
    body: 'Groundwater contamination from coal washery effluents reported in 4 villages.',
    timestamp: '2026-09-05T06:00:00Z',
    read: false,
  },
  {
    id: 'N-002',
    type: 'assigned',
    title: 'Challenge assigned to BIT Mesra',
    body: 'SUB-003 (Soil degradation in Gumla) matched with 81% fit score.',
    timestamp: '2026-09-06T10:30:00Z',
    read: false,
  },
  {
    id: 'N-003',
    type: 'milestone_complete',
    title: 'Milestone completed — PRJ-002',
    body: 'Curriculum Development milestone marked complete by RIMS Ranchi.',
    timestamp: '2026-09-10T14:00:00Z',
    read: true,
  },
  {
    id: 'N-004',
    type: 'verification_requested',
    title: 'Proof-of-Impact pending',
    body: 'SUB-001 (Barwadih hand pumps) awaits reporter verification photo.',
    timestamp: '2026-09-11T09:00:00Z',
    read: false,
  },
  {
    id: 'N-005',
    type: 'merged',
    title: 'AI deduplication — cluster detected',
    body: '3 similar reports near Barwadih block merged into primary SUB-001.',
    timestamp: '2026-09-12T11:15:00Z',
    read: true,
  },
]

// ─── Seed commitments ─────────────────────────────────────────────────────────
const SEED_COMMITMENTS: FundingCommitment[] = [
  {
    id: 'FC-001',
    submissionId: 'SUB-001',
    submissionTitle: 'Low-cost Groundwater-fed Community Water Supply',
    institution: 'BIT Mesra',
    partnerId: 'IND-001',
    amountLakhs: 30,
    type: 'CSR',
    status: 'Active',
    disbursedLakhs: 12.5,
  },
  {
    id: 'FC-002',
    submissionId: 'SUB-002',
    submissionTitle: 'Community Midwife Training & Telemedicine Link',
    institution: 'RIMS Ranchi',
    partnerId: 'IND-002',
    amountLakhs: 18,
    type: 'Co-Development',
    status: 'Active',
    disbursedLakhs: 6,
  },
]

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState: AppState = {
  submissions: [...SUBMISSIONS],
  projects: [...PROJECTS],
  clusters: [...DUPLICATE_CLUSTERS],
  notifications: SEED_NOTIFICATIONS,
  commitments: SEED_COMMITMENTS,
  mergedClusterIds: [],
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ENDORSE':
      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.submissionId
            ? { ...s, endorsements: s.endorsements + 1 }
            : s
        ),
      }

    case 'SET_STATUS':
      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.submissionId ? { ...s, status: action.status } : s
        ),
      }

    case 'ASSIGN':
      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.submissionId
            ? {
                ...s,
                status: 'Assigned to Institution' as SubmissionStatus,
                assignedInstitution: action.institution,
                fitScore: action.fitScore,
              }
            : s
        ),
        notifications: [
          {
            id: `N-${Date.now()}`,
            type: 'assigned',
            title: `Challenge assigned to ${action.institution}`,
            body: `${action.submissionId} routed with ${Math.round(action.fitScore * 100)}% fit score.`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      }

    case 'MERGE_CLUSTER':
      return {
        ...state,
        mergedClusterIds: [...state.mergedClusterIds, action.primaryId],
        // Boost urgency of the primary submission
        submissions: state.submissions.map((s) =>
          s.id === action.primaryId
            ? {
                ...s,
                urgencyScore: Math.min(100, s.urgencyScore + 8),
                endorsements:
                  s.endorsements +
                  (state.clusters.find((c) => c.primaryId === action.primaryId)
                    ?.mergedEndorsements ?? 0),
              }
            : s
        ),
        notifications: [
          {
            id: `N-${Date.now()}`,
            type: 'merged',
            title: 'Cluster merged',
            body: `Duplicate cluster for ${action.primaryId} merged. Urgency recalculated.`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      }

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }

    case 'COMPLETE_MILESTONE':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                milestones: p.milestones.map((m) =>
                  m.id === action.milestoneId
                    ? {
                        ...m,
                        completed: true,
                        completedDate: new Date().toISOString().split('T')[0],
                        rubricScore: action.rubricScore,
                        studentHours: m.studentHours || 40,
                      }
                    : m
                ),
              }
            : p
        ),
        notifications: [
          {
            id: `N-${Date.now()}`,
            type: 'milestone_complete',
            title: `Milestone completed`,
            body: `A milestone in project ${action.projectId} was marked complete.`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      }

    case 'ADD_MILESTONE':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, milestones: [...p.milestones, action.milestone] }
            : p
        ),
      }

    case 'ADD_COMMITMENT':
      return {
        ...state,
        commitments: [action.commitment, ...state.commitments],
      }

    case 'SUBMIT_VERIFICATION':
      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.submissionId
            ? { ...s, status: 'Resolved' as SubmissionStatus }
            : s
        ),
        notifications: [
          {
            id: `N-${Date.now()}`,
            type: 'resolved',
            title: 'Challenge resolved',
            body: `${action.submissionId} has been verified and marked as Resolved.`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface StoreContextValue {
  state: AppState
  endorse: (id: string) => void
  setStatus: (id: string, status: SubmissionStatus) => void
  assign: (id: string, institution: string, fitScore: number) => void
  mergeCluster: (primaryId: string) => void
  markRead: (id: string) => void
  markAllRead: () => void
  completeMilestone: (projectId: string, milestoneId: string, score: number) => void
  addCommitment: (c: FundingCommitment) => void
  submitVerification: (submissionId: string) => void
  addMilestone: (projectId: string, milestone: any) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const endorse = useCallback((id: string) => dispatch({ type: 'ENDORSE', submissionId: id }), [])
  const setStatus = useCallback((id: string, status: SubmissionStatus) => dispatch({ type: 'SET_STATUS', submissionId: id, status }), [])
  const assign = useCallback((id: string, institution: string, fitScore: number) => dispatch({ type: 'ASSIGN', submissionId: id, institution, fitScore }), [])
  const mergeCluster = useCallback((primaryId: string) => dispatch({ type: 'MERGE_CLUSTER', primaryId }), [])
  const markRead = useCallback((id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', id }), [])
  const markAllRead = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), [])
  const completeMilestone = useCallback((projectId: string, milestoneId: string, score: number) => dispatch({ type: 'COMPLETE_MILESTONE', projectId, milestoneId, rubricScore: score }), [])
  const addCommitment = useCallback((c: FundingCommitment) => dispatch({ type: 'ADD_COMMITMENT', commitment: c }), [])
  const submitVerification = useCallback((submissionId: string) => dispatch({ type: 'SUBMIT_VERIFICATION', submissionId }), [])
  const addMilestone = useCallback((projectId: string, milestone: any) => dispatch({ type: 'ADD_MILESTONE', projectId, milestone }), [])

  return (
    <StoreContext.Provider value={{ state, endorse, setStatus, assign, mergeCluster, markRead, markAllRead, completeMilestone, addCommitment, submitVerification, addMilestone }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
