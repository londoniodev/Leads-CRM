import prisma from '@/lib/prisma';
import {
  GeneratedProposalDTO,
  IAiClient,
  IProposalRepository,
  IPromptStrategy,
  LeadBusinessContext,
  LeadProposalEntity,
} from '@/domain/proposals/proposal.types';

export class GenerateProposalUseCase {
  constructor(
    private readonly aiClient: IAiClient,
    private readonly promptStrategy: IPromptStrategy,
    private readonly proposalRepository: IProposalRepository
  ) {}

  async execute(leadId: string): Promise<LeadProposalEntity> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        socialProfiles: true,
        contacts: true,
      },
    });

    if (!lead) {
      throw new Error(`No se encontró ningún prospecto con el ID: ${leadId}`);
    }

    const businessContext: LeadBusinessContext = {
      id: lead.id,
      companyName: lead.companyName,
      niche: lead.niche,
      city: lead.city,
      country: lead.country,
      address: lead.address,
      website: lead.website,
      phoneE164: lead.phoneE164,
      primaryEmail: lead.primaryEmail,
      rating: lead.rating,
      reviewsCount: lead.reviewsCount,
      googleCategory: lead.googleCategory,
      socialProfiles: lead.socialProfiles.map((s) => ({
        platform: s.platform,
        username: s.username,
        followers: s.followers,
        bio: s.bio,
      })),
      contacts: lead.contacts.map((c) => ({
        name: c.name,
        role: c.role,
        email: c.email,
        phone: c.phone,
      })),
    };

    const systemPrompt = this.promptStrategy.buildSystemPrompt();
    const userPrompt = this.promptStrategy.buildUserPrompt(businessContext);

    const generated = await this.aiClient.generateStructuredContent<GeneratedProposalDTO>(
      systemPrompt,
      userPrompt
    );

    return this.proposalRepository.createOrUpdate(leadId, generated, false);
  }
}
