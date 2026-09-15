import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller';

const router = Router();

router.post('/preview', challengeController.previewSubmission);
router.post('/submit', challengeController.submitChallenge);
router.post('/classify', challengeController.classifyText);
router.get('/similar', challengeController.getSimilarChallenges);
router.post('/:id/endorse', challengeController.endorseChallenge);
router.post('/:id/validate', challengeController.validateChallenge);
router.post('/:id/reject', challengeController.rejectChallenge);
router.post('/:id/flag', challengeController.flagChallenge);
router.post('/:id/assign', challengeController.assignChallenge);
router.get('/:id/routing', challengeController.getRoutingRecommendations);
router.post('/:id/verify', challengeController.submitVerification);
router.post('/:id/approve-verify', challengeController.approveVerification);

router.get('/', challengeController.getAllChallenges);
router.get('/:id', challengeController.getChallengeById);
router.get('/user/:userId', challengeController.getChallengesByUser);
router.get('/stats/dashboard', challengeController.getDashboardData);
router.get('/institution/:institutionId', challengeController.getChallengesByInstitution);
router.get('/assignable/:institutionId', challengeController.getAssignableChallenges);
router.get('/allocation/validated', challengeController.getValidatedChallengesForAllocation);

export default router;
