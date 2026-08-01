'use server';

import prisma from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Server Action para obtener los últimos 50 leads ordenados por fecha de creación descendente.
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
    console.error('Error al obtener leads desde PostgreSQL:', error.message);
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

    // Forzar revalidación de la ruta para refrescar la tabla en tiempo real
    revalidatePath('/');

    return {
      success: true,
      data: updatedLead,
    };
  } catch (error: any) {
    console.error('Error al actualizar estado del lead:', error.message);
    return {
      success: false,
      error: 'Error al actualizar el estado del lead en la base de datos.',
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
    console.error('Error al consultar lead por ID:', error.message);
    return {
      success: false,
      error: 'Error al consultar la base de datos.',
      data: null,
    };
  }
}

