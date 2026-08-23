import prisma, { ensureDatabaseSchema } from '@/lib/prisma';
import {
  GeneratedProposalDTO,
  IProposalRepository,
  LeadProposalEntity,
  UpdateProposalDTO,
} from '@/domain/proposals/proposal.types';

export class PrismaProposalRepository implements IProposalRepository {
  async findByLeadId(leadId: string): Promise<LeadProposalEntity | null> {
    try {
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
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2021') {
        await ensureDatabaseSchema();
        const retry = await prisma.leadProposal.findUnique({ where: { leadId } });
        if (!retry) return null;
        return {
          id: retry.id,
          leadId: retry.leadId,
          painDiagnosis: retry.painDiagnosis,
          transformationGoal: retry.transformationGoal,
          pilar1Leads: retry.pilar1Leads,
          pilar2Conversion: retry.pilar2Conversion,
          pilar3Automation: retry.pilar3Automation,
          whatsappPitch: retry.whatsappPitch,
          coldEmailPitch: retry.coldEmailPitch,
          callScript: retry.callScript,
          isCustomized: retry.isCustomized,
          generatedAt: retry.generatedAt,
          updatedAt: retry.updatedAt,
        };
      }
      throw error;
    }
  }

  async createOrUpdate(
    leadId: string,
    proposal: GeneratedProposalDTO,
    isCustomized: boolean = false
  ): Promise<LeadProposalEntity> {
    const executeUpsert = async () => {
      return prisma.leadProposal.upsert({
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
    };

    let record;
    try {
      record = await executeUpsert();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2021') {
        await ensureDatabaseSchema();
        record = await executeUpsert();
      } else {
        throw error;
      }
    }

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
    const executeUpdate = async () => {
      return prisma.leadProposal.update({
        where: { leadId },
        data: {
          ...updates,
          isCustomized: true,
        },
      });
    };

    let record;
    try {
      record = await executeUpdate();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2021') {
        await ensureDatabaseSchema();
        record = await executeUpdate();
      } else {
        throw error;
      }
    }

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
