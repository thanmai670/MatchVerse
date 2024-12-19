import express from 'express';
import * as jobController from '../controllers/jobController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();
router.post('/', authenticateUser, jobController.createJob);
router.get('/', authenticateUser, jobController.getJobs);
router.get('/:id', authenticateUser, jobController.getJobById);
router.put('/:id', authenticateUser, jobController.updateJob);
router.delete('/:id', authenticateUser, jobController.deleteJob);

export default router;