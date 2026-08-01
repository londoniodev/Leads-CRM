'use server';

import prisma from '@/lib/prisma';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { revalidatePath } from 'next/cache';

export interface CandidateLead {
  id: string;
  companyName: string;
  city: string | null;
  phoneE164: string | null;
}

export interface ConflictedProfileWithCandidates {
  id: string;
  platform: string;
  username: string | null;
  url: string;
  bio: string | null;
  followers: number | null;
  conflictNote: string | null;
  candidateLeads: CandidateLead[];
}

/**
 * Server Action para obtener los perfiles sociales en estado de Cuarentena (CONFLICTED)
 * junto con sus leads candidatos sugeridos por número telefónico E.164.
 */
export async function getConflictedProfilesWithCandidates() {
  try {
    const conflictedProfiles = await prisma.socialProfile.findMany({
      where: {
        status: 'CONFLICTED',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
    });

    const result: ConflictedProfileWithCandidates[] = [];

    for (const profile of conflictedProfiles) {
      let candidateLeads: CandidateLead[] = [];

      // Extraer teléfono de la biografía si existe
      if (profile.bio) {
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
        const matches = profile.bio.match(phoneRegex);

        if (matches && matches.length > 0) {
          for (const candidate of matches) {
            try {
              const parsed = parsePhoneNumberFromString(candidate.trim(), 'CO' as CountryCode);
              if (parsed && parsed.isValid()) {
                const phoneE164 = parsed.number;
                const leads = await prisma.lead.findMany({
                  where: { phoneE164 },
                  select: {
                    id: true,
                    companyName: true,
                    city: true,
                    phoneE164: true,
                  },
                });
                candidateLeads = [...candidateLeads, ...leads];
              }
            } catch {
              continue;
            }
          }
        }
      }

      // Si no se encontraron candidatos por bio, traer los últimos 10 leads mas recientes como fallback
      if (candidateLeads.length === 0) {
        candidateLeads = await prisma.lead.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            companyName: true,
            city: true,
            phoneE164: true,
          },
        });
      }

      // Deduplicar candidatos por ID
      const uniqueCandidates = Array.from(
        new Map(candidateLeads.map((item) => [item.id, item])).values()
      );

      result.push({
        id: profile.id,
        platform: profile.platform,
        username: profile.username,
        url: profile.url,
        bio: profile.bio,
        followers: profile.followers,
        conflictNote: profile.conflictNote,
        candidateLeads: uniqueCandidates,
      });
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Error al obtener perfiles en conflicto:', error.message);
    return {
      success: false,
      error: 'Error al consultar perfiles en conflicto.',
      data: [],
    };
  }
}

/**
 * Server Action para resolver manualmente un conflicto vinculando el SocialProfile a un Lead.
 */
export async function resolveConflictedProfile(profileId: string, leadId: string) {
  try {
    const updatedProfile = await prisma.socialProfile.update({
      where: {
        id: profileId,
      },
      data: {
        leadId,
        status: 'LINKED',
        conflictNote: null,
      },
    });

    // Recalcular score del lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { socialProfiles: true },
    });

    if (lead) {
      let score = 0;
      if (lead.companyName) score += 10;
      if (lead.website) score += 20;
      if (lead.phoneE164) score += 25;
      if (lead.primaryEmail) score += 25;
      score += Math.min(lead.socialProfiles.length * 10, 20);

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score,
          status: 'ENRICHED',
        },
      });
    }

    revalidatePath('/');
    revalidatePath(`/leads/${leadId}`);

    return {
      success: true,
      data: updatedProfile,
    };
  } catch (error: any) {
    console.error('Error al resolver perfil en conflicto:', error.message);
    return {
      success: false,
      error: 'Error al vincular el perfil social al lead.',
    };
  }
}
