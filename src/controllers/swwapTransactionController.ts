import { Request, Response } from 'express';
import { SwwapTransactionService } from '../services/swwapTransactionService';

const swwapTransactionService = new SwwapTransactionService();

export class SwwapTransactionController {
  // Create a new swwap proposal
  async createProposal(req: Request, res: Response) {
    try {
      const { fromUserId, toUserId, fromItemId, toItemId } = req.body;
      
      const proposal = await swwapTransactionService.createProposal(
        fromUserId,
        toUserId,
        fromItemId,
        toItemId
      );

      res.status(201).json(proposal);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create swwap proposal' });
    }
  }

  // Get a swwap proposal by ID
  async getProposalById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const proposal = await swwapTransactionService.getProposalById(id);

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get swwap proposal' });
    }
  }

  // Get all proposals for a user
  async getUserProposals(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const proposals = await swwapTransactionService.getUserProposals(userId);
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user proposals' });
    }
  }

  // Update proposal status
  async updateProposalStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const proposal = await swwapTransactionService.updateProposalStatus(id, status);
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update proposal status' });
    }
  }
} 