import { Request, Response } from 'express';
import { projectRepo, generateId, now, challengeRepo } from '../db/index';

export const createProject = async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const projectId = generateId('PRJ');
    const project = {
      id: projectId,
      challenge_id: input.challengeId,
      title: input.title,
      institution_id: input.institutionId,
      institution_name: input.institutionName,
      industry_partner_id: input.industryPartnerId || null,
      industry_partner_name: input.industryPartnerName || null,
      status: 'Planning',
      start_date: now().split('T')[0],
      target_date: input.targetDate,
      created_at: now(),
      updated_at: now(),
    };

    projectRepo.insert(
      project,
      input.team.map((m: any) => ({
        user_id: null,
        name: m.name,
        role: m.role,
        department: m.department || null,
        credit_hours: m.creditHours || 0,
      })),
      input.milestones.map((ms: any) => ({
        title: ms.title,
        description: ms.description,
        due_date: ms.dueDate,
        completed: 0,
        faculty_approved: 0,
        student_hours: ms.studentHours,
        deliverables: ms.deliverables,
      }))
    );

    challengeRepo.updateStatus(input.challengeId, 'In Progress');
    res.json({ success: true, projectId });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
};

export const acceptChallenge = async (req: Request, res: Response) => {
  try {
    challengeRepo.updateStatus((req.params.id as string), 'In Progress');
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const declineChallenge = async (req: Request, res: Response) => {
  try {
    challengeRepo.updateStatus((req.params.id as string), 'Validated', { flag_reason: `Declined by institution: ${req.body.reason}` });
    const { getDb } = await import('../db/index');
    getDb().prepare(`UPDATE challenges SET assigned_institution_id = NULL, assigned_institution_name = NULL, fit_score = NULL, status = 'Validated', updated_at = ? WHERE id = ?`).run(now(), (req.params.id as string));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const completeMilestone = async (req: Request, res: Response) => {
  res.json({ success: true });
};

export const approveMilestone = async (req: Request, res: Response) => {
  res.json({ success: true });
};

export const addMilestone = async (req: Request, res: Response) => {
  res.json({ success: true });
};

export const getAllProjects = async (req: Request, res: Response) => {
  res.json([]);
};

export const getProjectById = async (req: Request, res: Response) => {
  res.json(projectRepo.findById((req.params.id as string)));
};

export const getProjectsByInstitution = async (req: Request, res: Response) => {
  res.json(projectRepo.findByInstitution((req.params.institutionId as string)));
};
