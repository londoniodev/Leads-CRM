import {
  IProposalRepository,
  LeadProposalEntity,
  UpdateProposalDTO,
} from '@/domain/proposals/proposal.types';

export class UpdateProposalUseCase {
  constructor(private readonly proposalRepository: IProposalRepository) {}

  async execute(leadId: string, updates: UpdateProposalDTO): Promise<LeadProposalEntity> {
    const existing = await this.proposalRepository.findByLeadId(leadId);
    if (!existing) {
      throw new Error(`No existe una propuesta previa para el prospecto: ${leadId}`);
    }

    return this.proposalRepository.update(leadId, updates);
  }
}
