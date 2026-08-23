import prisma from '@/lib/prisma';
import {
  GeneratedProposalDTO,
  IProposalRepository,
  LeadProposalEntity,
  UpdateProposalDTO,
} from '@/domain/proposals/proposal.types';

export class PrismaProposalRepository implements IProposalRepository {
  async findByLeadId(leadId: string): Promise<LeadProposalEntity | null> {
    const proposal = await prisma.leadProposal.findUnique({
      where: { leadId },
    });

    if (!proposal) {
      return null;
    }

    return {
      id: proposal.id,
      leadId: proposal.leadId,
      painDiagnosis: proposal.painDiagnosis,
      transformationGoal: proposal.transformationGoal,
      pilar1Leads: proposal.pilar1Leads,
      pilar2Conversion: proposal.pilar2Conversion,
      pilar3Automation: proposal.pilar3Automation,
      whatsappPitch: proposal.whatsappPitch,
      coldEmailPitch: proposal.coldEmailPitch,
      callScript: proposal.callScript,
      isCustomized: proposal.isCustomized,
      generatedAt: proposal.generatedAt,
      updatedAt: proposal.updatedAt,
    };
  }

  async createOrUpdate(
    leadId: string,
    proposal: GeneratedProposalDTO,
    isCustomized: boolean = false
  ): Promise<LeadProposalEntity> {
    const record = await prisma.leadProposal.upsert({
      where: { leadId },
      create: {
        leadId,
        painDiagnosis: proposal.painDiagnosis,
        transformationGoal: proposal.transformationGoal,
        pilar1Leads: proposal.pilar1Leads,
        pilar2Conversion: proposal.pilar2Conversion,
        pilar3Automation: proposal.pilar3Automation,
        whatsappPitch: proposal.whatsappPitch,
        coldEmailPitch: proposal.coldEmailPitch,
        callScript: proposal.callScript,
        isCustomized,
      },
      update: {
        painDiagnosis: proposal.painDiagnosis,
        transformationGoal: proposal.transformationGoal,
        pilar1Leads: proposal.pilar1Leads,
        pilar2Conversion: proposal.pilar2Conversion,
        pilar3Automation: proposal.pilar3Automation,
        whatsappPitch: proposal.whatsappPitch,
        coldEmailPitch: proposal.coldEmailPitch,
        callScript: proposal.callScript,
        isCustomized,
      },
    });

    return {
      id: record.id,
      leadId: record.leadId,
      painDiagnosis: record.painDiagnosis,
      transformationGoal: record.transformationGoal,
      pilar1Leads: record.pilar1Leads,
      pilar2Conversion: record.pilar2Conversion,
      pilar3Automation: record.pilar3Automation,
      whatsappPitch: record.whatsappPitch,
      coldEmailPitch: record.coldEmailPitch,
      callScript: record.callScript,
      isCustomized: record.isCustomized,
      generatedAt: record.generatedAt,
      updatedAt: record.updatedAt,
    };
  }

  async update(leadId: string, updates: UpdateProposalDTO): Promise<LeadProposalEntity> {
    const record = await prisma.leadProposal.update({
      where: { leadId },
      data: {
        ...updates,
        isCustomized: true,
      },
    });

    return {
      id: record.id,
      leadId: record.leadId,
      painDiagnosis: record.painDiagnosis,
      transformationGoal: record.transformationGoal,
      pilar1Leads: record.pilar1Leads,
      pilar2Conversion: record.pilar2Conversion,
      pilar3Automation: record.pilar3Automation,
      whatsappPitch: record.whatsappPitch,
      coldEmailPitch: record.coldEmailPitch,
      callScript: record.callScript,
      isCustomized: record.isCustomized,
      generatedAt: record.generatedAt,
      updatedAt: record.updatedAt,
    };
  }
}
