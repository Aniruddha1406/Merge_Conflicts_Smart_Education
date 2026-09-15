import { Request, Response } from 'express';
import { challengeRepo, generateId, generateChallengeId, evidenceRepo, now, userRepo } from '../db/index';
import { classifyChallenge } from '../services/aiService';
import { detectAndStoreDuplicates, findSimilarChallenges } from '../services/duplicateService';
import { generateRoutingRecommendations, getStoredRecommendations } from '../services/routingService';
import {
  notifyChallengeSubmitted,
  notifyChallengeValidated,
  notifyChallengeAssigned,
  notifyVerificationRequested,
  notifyChallengeResolved,
} from '../services/notificationService';

export const previewSubmission = async (req: Request, res: Response) => {
  const { text, language = 'en' } = req.body;
  const classification = await classifyChallenge(text, language);
  const similar = findSimilarChallenges(text, text, classification.recommendedDomain, '', 4);
  res.json({ classification, similar });
};

export const submitChallenge = async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const classification = await classifyChallenge(`${input.title} ${input.description}`, input.language || 'en');

    let validUserId = input.submittedById;
    const existingUser = userRepo.findById(validUserId);
    if (!existingUser) {
      const defaultCitizen = userRepo.findByRole('citizen')[0];
      validUserId = defaultCitizen?.id || 'U-CITIZEN-001';
    }

    const challengeId = generateChallengeId();

    challengeRepo.insert({
      id: challengeId,
      title: input.title,
      description: input.description,
      domain: input.domain || classification.recommendedDomain,
      district: input.district,
      block: input.block || null,
      village: input.village || null,
      reporter_type: input.reporterType || 'citizen',
      submitted_by_id: validUserId,
      submitted_by_name: input.submittedByName || 'Citizen User',
      submitted_at: now(),
      status: 'Submitted',
      endorsements: 0,
      urgency_score: classification.urgencyScore,
      similar_count: 0,
      lat: input.lat || null,
      lng: input.lng || null,
      ai_category: classification.category,
      ai_subcategory: classification.subcategory,
      ai_priority: classification.priority,
      ai_keywords: classification.keywords.join(','),
      ai_technical_core: classification.technicalCore,
      ai_academic_field: classification.targetAcademicField,
      ai_confidence: classification.confidence,
      ai_triage: classification.triageType,
      flagged: 0,
    });

    if (input.fileIds?.length) {
      for (const fid of input.fileIds) {
        try {
          const { getDb } = await import('../db/index');
          getDb().prepare('UPDATE challenge_evidence SET challenge_id = ? WHERE id = ?').run(challengeId, fid);
        } catch {}
      }
    }

    try { detectAndStoreDuplicates(challengeId); } catch {}
    try { generateRoutingRecommendations(challengeId, input.domain || classification.recommendedDomain, classification.keywords, classification.urgencyScore); } catch {}
    try {
      const admins = userRepo.findByRole('government').concat(userRepo.findByRole('superadmin'));
      const adminIds = admins.map(a => a.id);
      notifyChallengeSubmitted(input.submittedById, challengeId, input.title, adminIds);
    } catch {}

    res.json({
      success: true,
      challengeId,
      classification: {
        category: classification.category,
        subcategory: classification.subcategory,
        priority: classification.priority,
        urgencyScore: classification.urgencyScore,
        keywords: classification.keywords,
        problemStatement: classification.problemStatement,
      },
    });
  } catch (err) {
    console.error('[submitChallenge]', err);
    res.status(500).json({ success: false, error: 'Failed to submit challenge.' });
  }
};

export const classifyText = async (req: Request, res: Response) => {
  try {
    const result = await classifyChallenge(req.body.text, req.body.language || 'en');
    res.json(result);
  } catch {
    res.json(null);
  }
};

export const getSimilarChallenges = async (req: Request, res: Response) => {
  const { title, description, domain, district } = req.query as any;
  res.json(findSimilarChallenges(title, description, domain, district, 3));
};

export const endorseChallenge = async (req: Request, res: Response) => {
  const ok = challengeRepo.endorse((req.params.id as string), req.body.userId);
  res.json({ success: ok });
};

export const validateChallenge = async (req: Request, res: Response) => {
  try {
    const { adminId, adminName } = req.body;
    const challenge = challengeRepo.findById((req.params.id as string));
    if (!challenge) return res.status(404).json({ success: false, error: 'Not found' });

    challengeRepo.updateStatus((req.params.id as string), 'Validated', { validated_at: now(), validated_by: adminName });

    try { generateRoutingRecommendations((req.params.id as string), challenge.domain, (challenge.ai_keywords || '').split(',').filter(Boolean), challenge.urgency_score); } catch {}
    try { notifyChallengeValidated(challenge.submitted_by_id, (req.params.id as string), challenge.title); } catch {}

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Validation failed' });
  }
};

export const rejectChallenge = async (req: Request, res: Response) => {
  try {
    challengeRepo.updateStatus((req.params.id as string), 'Rejected', { rejected_at: now(), rejection_reason: req.body.reason });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const flagChallenge = async (req: Request, res: Response) => {
  challengeRepo.flag((req.params.id as string), req.body.reason);
  res.json({ success: true });
};

export const assignChallenge = async (req: Request, res: Response) => {
  try {
    const challenge = challengeRepo.findById((req.params.id as string));
    if (!challenge) return res.status(404).json({ success: false });

    challengeRepo.assign((req.params.id as string), req.body.institutionId, req.body.institutionName, req.body.fitScore);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getRoutingRecommendations = async (req: Request, res: Response) => {
  const stored = getStoredRecommendations((req.params.id as string));
  if (stored.length > 0) return res.json(stored);

  const challenge = challengeRepo.findById((req.params.id as string));
  if (!challenge) return res.json([]);
  res.json(generateRoutingRecommendations((req.params.id as string), challenge.domain, (challenge.ai_keywords || '').split(',').filter(Boolean), challenge.urgency_score));
};

export const submitVerification = async (req: Request, res: Response) => {
  res.json({ success: true });
};

export const approveVerification = async (req: Request, res: Response) => {
  res.json({ success: true });
};

export const getAllChallenges = async (req: Request, res: Response) => {
  res.json(challengeRepo.findAll());
};

export const getChallengeById = async (req: Request, res: Response) => {
  res.json(challengeRepo.findById((req.params.id as string)));
};

export const getChallengesByUser = async (req: Request, res: Response) => {
  res.json(challengeRepo.findByUser((req.params.userId as string)));
};

export const getDashboardData = async (req: Request, res: Response) => {
  const { getDashboardStats } = await import('../db/index');
  res.json(getDashboardStats?.() || {});
};

export const getChallengesByInstitution = async (req: Request, res: Response) => {
  const { getDb } = await import('../db/index');
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM challenges WHERE assigned_institution_id = ? ORDER BY submitted_at DESC`).all((req.params.institutionId as string));
  res.json(rows);
};

export const getAssignableChallenges = async (req: Request, res: Response) => {
  const { getDb } = await import('../db/index');
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM challenges WHERE (assigned_institution_id = ? AND status IN ('Assigned to Institution','In Progress')) OR (status = 'Validated') ORDER BY urgency_score DESC, submitted_at DESC`).all((req.params.institutionId as string));
  res.json(rows);
};

export const getValidatedChallengesForAllocation = async (req: Request, res: Response) => {
  const { getDb } = await import('../db/index');
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM challenges WHERE status = 'Validated' ORDER BY urgency_score DESC, submitted_at DESC`).all();
  res.json(rows);
};
