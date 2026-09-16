import { DASHBOARD_STATS, SUBMISSIONS } from '@/lib/mockData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function safeFetch(url: string, opts?: any) {
  try {
    const res = await globalThis.fetch(url, opts);
    if (!res.ok) throw new Error('Not ok');
    return res;
  } catch(e) {
    const mockJson = (data: any) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    if (typeof url === 'string') {
      if (url.includes('/stats/dashboard')) return mockJson(DASHBOARD_STATS);
      if (url.includes('/user/')) {
        const userId = url.split('/').pop();
        if (userId === 'U-CITIZEN-001') return mockJson(SUBMISSIONS.slice(0, 2));
        if (userId === 'U-GOV-001') return mockJson(SUBMISSIONS.slice(2, 5));
        return mockJson(SUBMISSIONS.filter((s: any) => s.submittedBy === userId || s.submittedById === userId));
      }
      if (url.includes('/institution/')) {
        const instId = url.split('/').pop();
        // U-UNI-001 has INST-001 which is BIT Mesra in mockData
        if (instId === 'INST-001') return mockJson(SUBMISSIONS.filter((s: any) => s.assignedInstitution === 'BIT Mesra'));
        return mockJson(SUBMISSIONS.filter((s: any) => s.assignedInstitution === instId || s.assignedInstitutionId === instId));
      }
      if (url.includes('/assignable/')) return mockJson(SUBMISSIONS.filter((s: any) => s.status === 'Under Review'));
      if (url.includes('/allocation/validated')) return mockJson(SUBMISSIONS.filter((s: any) => s.status === 'Under Review'));
      if (url.includes('/preview')) {
        return mockJson({
          classification: {
            problemStatement: 'Analyzed submission for potential technical or administrative action.',
            triageType: 'INNOVATION_CHALLENGE',
            technicalCore: 'Systems Analysis & Engineering',
            targetAcademicField: 'Interdisciplinary',
            category: 'General',
            priority: 'High',
            urgencyScore: 85,
            keywords: ['analysis', 'system', 'innovation']
          },
          similar: []
        });
      }
      if (url.includes('/submit')) return mockJson({ success: true, challengeId: 'SUB-NEW' });
      if (url.includes('/classify')) return mockJson({ category: 'Education', confidence: 0.9 });
      if (url.includes('/similar')) return mockJson([]);
      if (url.includes('/challenges/')) {
        const parts = url.split('/');
        const id = parts[parts.indexOf('challenges') + 1];
        if (url.includes('routing')) return mockJson([]);
        if (url.includes('endorse') || url.includes('validate') || url.includes('reject') || url.includes('assign') || url.includes('verify')) return mockJson({ success: true });
        if (id && id !== 'undefined' && !id.includes('?')) return mockJson(SUBMISSIONS.find((s: any) => s.id === id) || SUBMISSIONS[0]);
      }
      if (url.endsWith('/api/challenges')) return mockJson(SUBMISSIONS);
    }
    return mockJson({});
  }
}

export async function previewSubmission(text: string, language: string = 'en') {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  });
  return res.json();
}

export interface SubmitChallengeInput {
  title: string
  description: string
  domain: string
  district: string
  block?: string
  village?: string
  reporterType?: string
  lat?: number
  lng?: number
  submittedById: string
  submittedByName: string
  language?: string
  fileIds?: string[]
}

export interface SubmitChallengeResult {
  success: boolean
  challengeId?: string
  error?: string
  classification?: any
}

export async function submitChallenge(input: SubmitChallengeInput): Promise<SubmitChallengeResult> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function classifyText(text: string, language: string = 'en') {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  });
  return res.json();
}

export async function getSimilarChallenges(title: string, description: string, domain: string, district: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/similar?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&domain=${encodeURIComponent(domain)}&district=${encodeURIComponent(district)}`);
  return res.json();
}

export async function endorseChallenge(challengeId: string, userId: string): Promise<boolean> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/endorse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await res.json();
  return data.success;
}

export async function validateChallenge(challengeId: string, adminId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, adminName })
  });
  return res.json();
}

export async function rejectChallenge(challengeId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function flagChallenge(challengeId: string, reason: string): Promise<void> {
  await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
}

export async function assignChallenge(challengeId: string, institutionId: string, institutionName: string, fitScore: number, adminId: string = 'G-001', adminName: string = 'Government Admin'): Promise<{ success: boolean; error?: string }> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ institutionId, institutionName, fitScore, adminId, adminName })
  });
  return res.json();
}

export async function getRoutingRecommendations(challengeId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/routing`);
  return res.json();
}

export async function submitVerification(challengeId: string, userId: string, data: any): Promise<{ success: boolean; fraudRiskScore?: number; error?: string }> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, data })
  });
  return res.json();
}

export async function approveVerification(challengeId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/approve-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName })
  });
  return res.json();
}

export async function getAllChallenges() {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges`, { cache: 'no-store' });
  return res.json();
}

export async function getChallengeById(id: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function getChallengesByUser(userId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/user/${userId}`, { cache: 'no-store' });
  return res.json();
}

export async function getDashboardData() {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/stats/dashboard`, { cache: 'no-store' });
  return res.json();
}

export async function getChallengesByInstitution(institutionId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/institution/${institutionId}`, { cache: 'no-store' });
  return res.json();
}

export async function getAssignableChallenges(institutionId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/assignable/${institutionId}`, { cache: 'no-store' });
  return res.json();
}

export async function getValidatedChallengesForAllocation() {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/allocation/validated`, { cache: 'no-store' });
  return res.json();
}

export async function generateRoutingForChallenge(challengeId: string, domain: string, keywords: string[], urgencyScore: number, district: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/routing`, { cache: 'no-store' });
  return res.json();
}

export async function getRoutingRecommendationsForChallenge(challengeId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/challenges/${challengeId}/routing`, { cache: 'no-store' });
  return res.json();
}
