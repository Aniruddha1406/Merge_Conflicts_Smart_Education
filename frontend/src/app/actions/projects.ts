// Client-side wrappers for the new Express backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function createProject(input: any) {
  const res = await fetch(`${BACKEND_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function acceptChallenge(challengeId: string) {
  const res = await fetch(`${BACKEND_URL}/api/projects/challenges/${challengeId}/accept`, {
    method: 'POST'
  });
  return res.json();
}

export async function declineChallenge(challengeId: string, reason: string) {
  const res = await fetch(`${BACKEND_URL}/api/projects/challenges/${challengeId}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function completeMilestone(projectId: string, milestoneId: string) {
  const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/milestones/${milestoneId}/complete`, {
    method: 'POST'
  });
  return res.json();
}

export async function approveMilestone(projectId: string, milestoneId: string, adminName: string) {
  const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/milestones/${milestoneId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName })
  });
  return res.json();
}

export async function addMilestone(projectId: string, input: any) {
  const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function getAllProjects() {
  const res = await fetch(`${BACKEND_URL}/api/projects`, { cache: 'no-store' });
  return res.json();
}

export async function getProjectById(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function getProjectsByInstitution(institutionId: string) {
  const res = await fetch(`${BACKEND_URL}/api/projects/institution/${institutionId}`, { cache: 'no-store' });
  return res.json();
}
export async function createFundingCommitment(input: any) { const res = await fetch(BACKEND_URL + '/api/projects/commitments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); return res.json(); }
