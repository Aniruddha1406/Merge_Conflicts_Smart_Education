import { INITIAL_FACULTY, INITIAL_STUDENTS } from '@/lib/mockData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function getMockPersonnel() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_personnel');
    if (stored) return JSON.parse(stored);
    const initial = { faculty: [...INITIAL_FACULTY], students: [...INITIAL_STUDENTS] };
    localStorage.setItem('mock_personnel', JSON.stringify(initial));
    return initial;
  }
  return { faculty: [...INITIAL_FACULTY], students: [...INITIAL_STUDENTS] };
}

function saveMockPersonnel(data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_personnel', JSON.stringify(data));
  }
}

async function safeFetch(url: string, opts?: any) {
  try {
    const res = await globalThis.fetch(url, opts);
    if (!res.ok) throw new Error('Not ok');
    return res;
  } catch(e) {
    const mockJson = (data: any) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    if (typeof url === 'string') {
      const PERSONNEL = getMockPersonnel();

      if (url.endsWith('/api/personnel')) {
        return mockJson(PERSONNEL);
      }
      
      if (url.endsWith('/api/personnel/faculty')) {
        if (opts && opts.method === 'POST' && opts.body) {
          const body = JSON.parse(opts.body);
          PERSONNEL.faculty.push(body.name);
          saveMockPersonnel(PERSONNEL);
          return mockJson({ success: true, name: body.name });
        }
      }

      if (url.endsWith('/api/personnel/students')) {
        if (opts && opts.method === 'POST' && opts.body) {
          const body = JSON.parse(opts.body);
          PERSONNEL.students.push(body);
          saveMockPersonnel(PERSONNEL);
          return mockJson({ success: true, student: body });
        }
      }
    }
    return mockJson({});
  }
}

export async function getPersonnel() {
  const res = await safeFetch(`${BACKEND_URL}/api/personnel`, { cache: 'no-store' });
  return res.json();
}

export async function addFaculty(name: string) {
  const res = await safeFetch(`${BACKEND_URL}/api/personnel/faculty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function addStudent(student: { name: string, degree: string, dept: string }) {
  const res = await safeFetch(`${BACKEND_URL}/api/personnel/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  return res.json();
}
