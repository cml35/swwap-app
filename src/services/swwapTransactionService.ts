import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SwwapTransactionService {
  // Create a new swwap proposal
  async createProposal(fromUserId: string, toUserId: string, fromItemId: string, toItemId: string) {
    return prisma.swwapTransaction.create({
      data: {
        fromUserId,
        toUserId,
        fromItemId,
        toItemId,
        status: 'pending'
      }
    });
  }

  // Get a swwap proposal by ID
  async getProposalById(id: string) {
    return prisma.swwapTransaction.findUnique({
      where: { id }
    });
  }

  // Get all proposals for a user (both sent and received)
  async getUserProposals(userId: string) {
    return prisma.swwapTransaction.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      }
    });
  }

  // Update proposal status
  async updateProposalStatus(id: string, status: 'accepted' | 'rejected') {
    return prisma.swwapTransaction.update({
      where: { id },
      data: { status }
    });
  }
} 