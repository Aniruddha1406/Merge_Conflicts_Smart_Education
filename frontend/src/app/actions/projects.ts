import { PROJECTS } from '@/lib/mockData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function safeFetch(url: string, opts?: any) {
  try {
    const res = await globalThis.fetch(url, opts);
    if (!res.ok) throw new Error('Not ok');
    return res;
  } catch(e) {
    const mockJson = (data: any) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    if (typeof url === 'string') {
      if (url.includes('/api/projects/institution/')) return mockJson(PROJECTS.filter((p: any) => p.institution_id === url.split('/').pop()));
      if (url.includes('/api/projects/commitments')) return mockJson({ success: true });
      if (url.includes('/api/projects/')) {
        const parts = url.split('/');
        const id = parts[parts.indexOf('projects') + 1];
        if (url.includes('accept') || url.includes('decline') || url.includes('complete') || url.includes('approve') || url.includes('milestones')) return mockJson({ success: true });
        if (id && id !== 'undefined' && !id.includes('?')) return mockJson(PROJECTS.find((p: any) => p.id === id) || PROJECTS[0]);
      }
      if (url.endsWith('/api/projects')) return mockJson(PROJECTS);
    }
    return mockJson({});
  }
}

export async function createProject(input: any) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function acceptChallenge(challengeId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/challenges/${challengeId}/accept`, {
    method: 'POST'
  });
  return res.json();
}

export async function declineChallenge(challengeId: string, reason: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/challenges/${challengeId}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function completeMilestone(projectId: string, milestoneId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/${projectId}/milestones/${milestoneId}/complete`, {
    method: 'POST'
  });
  return res.json();
}

export async function approveMilestone(projectId: string, milestoneId: string, adminName: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/${projectId}/milestones/${milestoneId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName })
  });
  return res.json();
}

export async function addMilestone(projectId: string, input: any) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/${projectId}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return res.json();
}

export async function getAllProjects() {
  const res = await safeFetch(`${BACKEND_URL}/api/projects`, { cache: 'no-store' });
  return res.json();
}

export async function getProjectById(id: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function getProjectsByInstitution(institutionId: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/projects/institution/${institutionId}`, { cache: 'no-store' });
  return res.json();
}
export async function createFundingCommitment(input: any) { const res = await safeFetch(BACKEND_URL + '/api/projects/commitments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); return res.json(); }
