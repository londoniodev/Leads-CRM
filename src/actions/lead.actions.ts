'use server';

import prisma from '@/lib/prisma';
import apifyClient from '@/lib/apify';
import { LeadStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Server Action para obtener los últimos 100 leads ordenados por fecha de creación descendente.
 */
export async function getLeads() {
  try {
    const leads = await prisma.lead.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        socialProfiles: true,
        contacts: true,
      },
    });

    return {
      success: true,
      data: leads,
    };
  } catch (error: any) {
    console.error('Error al obtener leads desde PostgreSQL:', error?.message || error);
    return {
      success: false,
      error: 'Error al consultar los leads de la base de datos.',
      data: [],
    };
  }
}

/**
 * Server Action para actualizar el estado de un lead de forma reactiva.
 */
export async function updateLeadStatus(leadId: string, status: LeadStatus | string) {
  try {
    const updatedLead = await prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        status: status as LeadStatus,
      },
    });

    revalidatePath('/');

    return {
      success: true,
      data: updatedLead,
    };
  } catch (error: any) {
    console.error('Error al actualizar estado del lead:', error?.message || error);
    return {
      success: false,
      error: 'Error al actualizar el estado del lead en la base de datos.',
    };
  }
}

/**
 * Server Action para eliminar un lead por su ID eliminando primero relaciones hijas.
 */
export async function deleteLead(leadId: string) {
  try {
    await prisma.contactPerson.deleteMany({ where: { leadId } });
    await prisma.leadProposal.deleteMany({ where: { leadId } });
    await prisma.socialProfile.updateMany({ where: { leadId }, data: { leadId: null } });
    await prisma.lead.delete({
      where: { id: leadId },
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'Lead eliminado con éxito.',
    };
  } catch (error: any) {
    console.error('Error al eliminar lead:', error?.message || error);
    return {
      success: false,
      error: 'Error al eliminar el lead de la base de datos.',
    };
  }
}

/**
 * Server Action para disparar el enriquecimiento manual de redes sociales via SERP-to-Social.
 */
export async function enrichLeadSocials(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: 'Lead no encontrado.' };
    }

    const companyName = lead.companyName;
    const location = lead.city || lead.country || '';

    const dorks = [
      location ? `site:instagram.com "${companyName}" "${location}"` : `site:instagram.com "${companyName}"`,
      location ? `site:tiktok.com "${companyName}" "${location}"` : `site:tiktok.com "${companyName}"`,
      location ? `site:facebook.com "${companyName}" "${location}"` : `site:facebook.com "${companyName}"`,
    ].join('\n');

    const rawSerpBridgeWebhook = process.env.PROCESSOR_WEBHOOK_URL_SERP_BRIDGE || process.env.PROCESSOR_WEBHOOK_URL?.replace(/\/webhooks\/apify\/leads.*$/, '/webhooks/apify/serp-bridge') || 'http://72.62.161.199:3001/webhooks/apify/serp-bridge';
    const secretToken = process.env.WEBHOOK_SECRET_TOKEN || 'xX6+0+EuTlUynI/USQli6I14OgrVg3dAqnrzTkuOV8w=';
    const formattedWebhookUrl = rawSerpBridgeWebhook.includes('secret=')
      ? rawSerpBridgeWebhook
      : `${rawSerpBridgeWebhook}${rawSerpBridgeWebhook.includes('?') ? '&' : '?'}secret=${encodeURIComponent(secretToken)}`;

    const googleSearchInput = {
      queries: dorks,
      maxPagesPerQuery: 1,
      resultsPerPage: 10,
    };

    await apifyClient.actor('apify/google-search-scraper').start(
      googleSearchInput,
      {
        webhooks: [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED' as any],
            requestUrl: formattedWebhookUrl,
          },
        ],
      }
    );

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'ENRICHING' },
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'Enriquecimiento encolado...',
    };
  } catch (error: any) {
    console.error('Error al enriquecer redes del lead:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Error al solicitar enriquecimiento en Apify.',
    };
  }
}

/**
 * Server Action para actualización masiva de estados (Bulk Action).
 */
export async function updateLeadsStatusBulk(leadIds: string[], status: LeadStatus) {
  try {
    if (!leadIds || leadIds.length === 0) {
      return { success: false, error: 'No se enviaron IDs de leads.' };
    }

    const result = await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
      },
      data: {
        status,
      },
    });

    revalidatePath('/');

    return {
      success: true,
      count: result.count,
      message: `${result.count} lead(s) actualizados a ${status}.`,
    };
  } catch (error: any) {
    console.error('Error en actualización masiva de leads:', error?.message || error);
    return {
      success: false,
      error: 'Error al actualizar leads en lote.',
    };
  }
}

/**
 * Server Action para eliminación masiva de leads (Bulk Action).
 */
export async function deleteLeadsBulk(leadIds: string[]) {
  try {
    if (!leadIds || leadIds.length === 0) {
      return { success: false, error: 'No se enviaron IDs de leads.' };
    }

    await prisma.contactPerson.deleteMany({ where: { leadId: { in: leadIds } } });
    await prisma.leadProposal.deleteMany({ where: { leadId: { in: leadIds } } });
    await prisma.socialProfile.updateMany({ where: { leadId: { in: leadIds } }, data: { leadId: null } });

    const result = await prisma.lead.deleteMany({
      where: {
        id: { in: leadIds },
      },
    });

    revalidatePath('/');

    return {
      success: true,
      count: result.count,
      message: `${result.count} lead(s) eliminados correctamente.`,
    };
  } catch (error: any) {
    console.error('Error en eliminación masiva de leads:', error?.message || error);
    return {
      success: false,
      error: 'Error al eliminar leads en lote.',
    };
  }
}

/**
 * Server Action para obtener un lead específico por su ID con sus relaciones.
 */
export async function getLeadById(id: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        socialProfiles: true,
        contacts: true,
        proposal: true,
      },
    });

    if (!lead) {
      return {
        success: false,
        error: 'Lead no encontrado',
        data: null,
      };
    }

    return {
      success: true,
      data: lead,
    };
  } catch (error: any) {
    console.error('Error al consultar lead por ID:', error?.message || error);
    return {
      success: false,
      error: 'Error al consultar la base de datos.',
      data: null,
    };
  }
}

/**
 * Server Action para obtener los perfiles sociales en estado de Cuarentena/Conflicto.
 */
export async function getConflictedSocialProfiles() {
  try {
    const profiles = await prisma.socialProfile.findMany({
      where: {
        status: 'CONFLICTED',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
    });

    return {
      success: true,
      data: profiles,
    };
  } catch (error: any) {
    console.error('Error al consultar perfiles en conflicto:', error?.message || error);
    return {
      success: false,
      error: 'Error al consultar perfiles en cuarentena.',
      data: [],
    };
  }
}
