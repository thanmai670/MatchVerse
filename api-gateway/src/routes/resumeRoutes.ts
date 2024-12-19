import express from 'express';
import * as resumeController from '../controllers/resumeController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authenticateUser, resumeController.createResume);
router.get('/', authenticateUser, resumeController.getResumes);
router.get('/:id', authenticateUser, resumeController.getResumeById);
router.put('/:id', authenticateUser, resumeController.updateResume);
router.delete('/:id', authenticateUser, resumeController.deleteResume);

export default router;
