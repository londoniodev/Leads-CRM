'use server';

import { revalidatePath } from 'next/cache';
import { makeProposalService } from '@/application/proposals/proposal-service.factory';
import { UpdateProposalDTO } from '@/domain/proposals/proposal.types';

export async function generateLeadProposalAction(leadId: string) {
  try {
    if (!leadId) {
      return { success: false, error: 'ID de lead no provisto.' };
    }

    const { generateProposalUseCase } = makeProposalService();
    const proposal = await generateProposalUseCase.execute(leadId);

    revalidatePath(`/leads/${leadId}`);

    return {
      success: true,
      data: proposal,
    };
  } catch (error: any) {
    console.error('Error al generar la propuesta con IA:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Ocurrió un error inesperado al procesar la propuesta con IA.',
    };
  }
}

export async function saveLeadProposalAction(leadId: string, updates: UpdateProposalDTO) {
  try {
    if (!leadId) {
      return { success: false, error: 'ID de lead no provisto.' };
    }

    const { updateProposalUseCase } = makeProposalService();
    const updated = await updateProposalUseCase.execute(leadId, updates);

    revalidatePath(`/leads/${leadId}`);

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Error al guardar la propuesta personalizada:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Error al guardar los cambios en la base de datos.',
    };
  }
}

export async function getLeadProposalAction(leadId: string) {
  try {
    if (!leadId) {
      return { success: false, error: 'ID de lead no provisto.', data: null };
    }

    const { proposalRepository } = makeProposalService();
    const proposal = await proposalRepository.findByLeadId(leadId);

    return {
      success: true,
      data: proposal,
    };
  } catch (error: any) {
    console.error('Error al consultar la propuesta del lead:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Error al obtener la propuesta.',
      data: null,
    };
  }
}
