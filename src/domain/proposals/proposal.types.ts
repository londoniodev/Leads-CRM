export interface SocialProfileContext {
  platform: string;
  username: string | null;
  followers: number | null;
  bio: string | null;
}

export interface ContactPersonContext {
  name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
}

export interface LeadBusinessContext {
  id: string;
  companyName: string;
  niche: string;
  city: string | null;
  country: string | null;
  address: string | null;
  website: string | null;
  phoneE164: string | null;
  primaryEmail: string | null;
  rating: number | null;
  reviewsCount: number | null;
  googleCategory: string | null;
  socialProfiles: SocialProfileContext[];
  contacts: ContactPersonContext[];
}

export interface GeneratedProposalDTO {
  painDiagnosis: string;
  transformationGoal: string;
  pilar1Leads: string;
  pilar2Conversion: string;
  pilar3Automation: string;
  whatsappPitch: string;
  coldEmailPitch: string;
  callScript: string;
}

export interface UpdateProposalDTO {
  painDiagnosis?: string;
  transformationGoal?: string;
  pilar1Leads?: string;
  pilar2Conversion?: string;
  pilar3Automation?: string;
  whatsappPitch?: string;
  coldEmailPitch?: string;
  callScript?: string;
}

export interface LeadProposalEntity {
  id: string;
  leadId: string;
  painDiagnosis: string;
  transformationGoal: string;
  pilar1Leads: string;
  pilar2Conversion: string;
  pilar3Automation: string;
  whatsappPitch: string;
  coldEmailPitch: string;
  callScript: string;
  isCustomized: boolean;
  generatedAt: Date;
  updatedAt: Date;
}

export interface IPromptStrategy {
  buildSystemPrompt(): string;
  buildUserPrompt(context: LeadBusinessContext): string;
}

export interface IAiClient {
  generateStructuredContent<T>(systemPrompt: string, userPrompt: string): Promise<T>;
}

export interface IProposalRepository {
  findByLeadId(leadId: string): Promise<LeadProposalEntity | null>;
  createOrUpdate(leadId: string, proposal: GeneratedProposalDTO, isCustomized?: boolean): Promise<LeadProposalEntity>;
  update(leadId: string, updates: UpdateProposalDTO): Promise<LeadProposalEntity>;
}
