import { Router } from 'express';
import * as projectController from '../controllers/project.controller';

const router = Router();

router.post('/', projectController.createProject);
router.post('/challenges/:id/accept', projectController.acceptChallenge);
router.post('/challenges/:id/decline', projectController.declineChallenge);
router.post('/:projectId/milestones/:milestoneId/complete', projectController.completeMilestone);
router.post('/:projectId/milestones/:milestoneId/approve', projectController.approveMilestone);
router.post('/:projectId/milestones', projectController.addMilestone);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/institution/:institutionId', projectController.getProjectsByInstitution);

export default router;
