import express from 'express'
import *  as  matchController from '../controllers/matchController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();
router.post('/', authenticateUser, matchController.createMatch);
router.get('/', authenticateUser, matchController.getMatches);

export default router;