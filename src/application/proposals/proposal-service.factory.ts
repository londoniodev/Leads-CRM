import { GeminiAiClient } from '@/infrastructure/ai/gemini-ai.client';
import { ThreePillarsTransformationStrategy } from '@/infrastructure/ai/strategies/three-pillars.strategy';
import { PrismaProposalRepository } from '@/infrastructure/repositories/prisma-proposal.repository';
import { GenerateProposalUseCase } from './generate-proposal.use-case';
import { UpdateProposalUseCase } from './update-proposal.use-case';

export function makeProposalService() {
  const proposalRepository = new PrismaProposalRepository();
  const promptStrategy = new ThreePillarsTransformationStrategy();
  const aiClient = new GeminiAiClient();

  const generateProposalUseCase = new GenerateProposalUseCase(
    aiClient,
    promptStrategy,
    proposalRepository
  );
  const updateProposalUseCase = new UpdateProposalUseCase(proposalRepository);

  return {
    proposalRepository,
    generateProposalUseCase,
    updateProposalUseCase,
  };
}
