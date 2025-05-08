import { Router } from 'express';
import { SwwapTransactionController } from '../controllers/swwapTransactionController';

const router = Router();
const swwapTransactionController = new SwwapTransactionController();

// Create a new swwap proposal
router.post('/proposals', swwapTransactionController.createProposal);

// Get a swwap proposal by ID
router.get('/proposals/:id', swwapTransactionController.getProposalById);

// Get all proposals for a user
router.get('/users/:userId/proposals', swwapTransactionController.getUserProposals);

// Update proposal status
router.patch('/proposals/:id/status', swwapTransactionController.updateProposalStatus);

export default router; 