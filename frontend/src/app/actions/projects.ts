import { PROJECTS as INITIAL_PROJECTS, SUBMISSIONS as INITIAL_SUBMISSIONS } from '@/lib/mockData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function getMockProjects() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_projects');
    if (stored) {
      const parsed = JSON.parse(stored);
      let modified = false;
      parsed.forEach((p: any) => {
        if (p.industryPartner === 'Tata Projects CSR') {
          p.industryPartner = 'Tata Projects (CSR Division)';
          modified = true;
        }
        if (p.milestones) {
          p.milestones.forEach((m: any, i: number) => {
            if (!m.id) {
              m.id = `M-${p.id}-${i}-${Date.now()}`;
              modified = true;
            }
          });
        }
      });
      if (modified) localStorage.setItem('mock_projects', JSON.stringify(parsed));
      return parsed;
    }
    localStorage.setItem('mock_projects', JSON.stringify(INITIAL_PROJECTS));
  }
  return [...INITIAL_PROJECTS];
}

function getMockSubmissions() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_submissions');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('mock_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
  }
  return [...INITIAL_SUBMISSIONS];
}

function saveMockProjects(projects: any) {
  if (typeof window !== 'undefined') localStorage.setItem('mock_projects', JSON.stringify(projects));
}

function saveMockSubmissions(submissions: any) {
  if (typeof window !== 'undefined') localStorage.setItem('mock_submissions', JSON.stringify(submissions));
}

async function safeFetch(url: string, opts?: any) {
  try {
    const res = await globalThis.fetch(url, opts);
    if (!res.ok) throw new Error('Not ok');
    return res;
  } catch(e) {
    const mockJson = (data: any) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    if (typeof url === 'string') {
      const PROJECTS = getMockProjects();
      const SUBMISSIONS = getMockSubmissions();

      const mapProject = (p: any) => ({
        ...p,
        target_date: p.targetDate || p.target_date,
        institution_name: p.institution || p.institution_name,
        industry_partner_name: p.industryPartner || p.industry_partner_name
      });

      if (url.includes('/api/projects/institution/')) {
        const instId = url.split('/').pop();
        return mockJson(PROJECTS.filter((p: any) => p.institution === 'BIT Mesra' || p.institutionId === instId).map(mapProject));
      }
      if (url.includes('/api/projects/commitments')) return mockJson({ success: true });
      if (url.includes('/api/projects/')) {
        const parts = url.split('/');
        const id = parts[parts.indexOf('projects') + 1];
        if (url.includes('accept')) {
          const challengeId = parts[parts.indexOf('challenges') + 1];
          const sub = SUBMISSIONS.find((s: any) => s.id === challengeId);
          if (sub) {
             sub.status = 'Assigned to Institution';
             saveMockSubmissions(SUBMISSIONS);
          }
          return mockJson({ success: true });
        }
        if (url.includes('decline')) {
          const challengeId = parts[parts.indexOf('challenges') + 1];
          const sub = SUBMISSIONS.find((s: any) => s.id === challengeId);
          if (sub) {
             sub.status = 'Declined';
             saveMockSubmissions(SUBMISSIONS);
          }
          return mockJson({ success: true });
        }
        if (url.includes('complete')) {
          const projectId = parts[parts.indexOf('projects') + 1];
          const milestoneId = parts[parts.indexOf('milestones') + 1];
          const proj = PROJECTS.find((p: any) => p.id === projectId);
          if (proj) {
            const ms = proj.milestones.find((m: any) => m.id === milestoneId);
            if (ms) {
              ms.completed = true;
              ms.completedDate = new Date().toISOString().split('T')[0];
              saveMockProjects(PROJECTS);
            }
          }
          return mockJson({ success: true });
        }
        if (url.includes('approve')) return mockJson({ success: true });
        if (url.includes('milestones') && opts && opts.method === 'POST') {
          const projectId = parts[parts.indexOf('projects') + 1];
          const proj = PROJECTS.find((p: any) => p.id === projectId);
          if (proj) {
            const body = JSON.parse(opts.body);
            if (!proj.milestones) proj.milestones = [];
            proj.milestones.push(body);
            saveMockProjects(PROJECTS);
          }
          return mockJson({ success: true });
        }
        if (id && id !== 'undefined' && !id.includes('?')) {
          const found = PROJECTS.find((p: any) => p.id === id) || PROJECTS[0];
          return mockJson(mapProject(found));
        }
      }
      if (url.endsWith('/api/projects')) {
        if (opts && opts.method === 'POST' && opts.body) {
          const body = JSON.parse(opts.body);
          const newProject: any = {
            id: 'PRJ-' + Math.floor(Math.random() * 10000),
            submissionId: body.challengeId,
            title: body.title,
            institution: body.institutionName || 'BIT Mesra',
            status: 'Planning',
            startDate: new Date().toISOString().split('T')[0],
            targetDate: body.targetDate || '2027-03-31',
            milestones: body.milestones || [],
            team: body.team || [],
          };
          PROJECTS.unshift(newProject);
          saveMockProjects(PROJECTS);
          return mockJson(mapProject(newProject));
        }
        return mockJson(PROJECTS.map(mapProject));
      }
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
