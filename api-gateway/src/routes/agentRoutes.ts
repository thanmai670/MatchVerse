import express from 'express';
import * as agentController from '../controllers/agentController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authenticateUser, agentController.createAgent);
router.get('/', authenticateUser, agentController.getAgents);
router.get('/:id', authenticateUser, agentController.getAgentById);
router.put('/:id', authenticateUser, agentController.updateAgent);
router.delete('/:id', authenticateUser, agentController.deleteAgent);

export default router;
