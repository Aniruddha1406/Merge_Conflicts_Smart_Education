// Client-side wrappers for the new Express backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function previewSubmission(text: string, language: string = 'en') {
  const res = await fetch(`${BACKEND_URL}/api/challenges/preview`, {
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
  const res = await fetch(`${BACKEND_URL}/api/challenges/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function classifyText(text: string, language: string = 'en') {
  const res = await fetch(`${BACKEND_URL}/api/challenges/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  });
  return res.json();
}

export async function getSimilarChallenges(title: string, description: string, domain: string, district: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/similar?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&domain=${encodeURIComponent(domain)}&district=${encodeURIComponent(district)}`);
  return res.json();
}

export async function endorseChallenge(challengeId: string, userId: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/endorse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await res.json();
  return data.success;
}

export async function validateChallenge(challengeId: string, adminId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, adminName })
  });
  return res.json();
}

export async function rejectChallenge(challengeId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function flagChallenge(challengeId: string, reason: string): Promise<void> {
  await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
}

export async function assignChallenge(challengeId: string, institutionId: string, institutionName: string, fitScore: number, adminId: string = 'G-001', adminName: string = 'Government Admin'): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ institutionId, institutionName, fitScore, adminId, adminName })
  });
  return res.json();
}

export async function getRoutingRecommendations(challengeId: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/routing`);
  return res.json();
}

export async function submitVerification(challengeId: string, userId: string, data: any): Promise<{ success: boolean; fraudRiskScore?: number; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, data })
  });
  return res.json();
}

export async function approveVerification(challengeId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/approve-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName })
  });
  return res.json();
}

export async function getAllChallenges() {
  const res = await fetch(`${BACKEND_URL}/api/challenges`, { cache: 'no-store' });
  return res.json();
}

export async function getChallengeById(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function getChallengesByUser(userId: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/user/${userId}`, { cache: 'no-store' });
  return res.json();
}

export async function getDashboardData() {
  const res = await fetch(`${BACKEND_URL}/api/challenges/stats/dashboard`, { cache: 'no-store' });
  return res.json();
}

export async function getChallengesByInstitution(institutionId: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/institution/${institutionId}`, { cache: 'no-store' });
  return res.json();
}

export async function getAssignableChallenges(institutionId: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/assignable/${institutionId}`, { cache: 'no-store' });
  return res.json();
}

export async function getValidatedChallengesForAllocation() {
  const res = await fetch(`${BACKEND_URL}/api/challenges/allocation/validated`, { cache: 'no-store' });
  return res.json();
}

export async function generateRoutingForChallenge(challengeId: string, domain: string, keywords: string[], urgencyScore: number, district: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/routing`, { cache: 'no-store' });
  return res.json();
}

export async function getRoutingRecommendationsForChallenge(challengeId: string) {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${challengeId}/routing`, { cache: 'no-store' });
  return res.json();
}
