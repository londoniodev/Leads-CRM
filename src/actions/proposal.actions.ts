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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado al procesar la propuesta con IA.';
    console.error('Error al generar la propuesta con IA:', message);
    return {
      success: false,
      error: message,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al guardar los cambios en la base de datos.';
    console.error('Error al guardar la propuesta personalizada:', message);
    return {
      success: false,
      error: message,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener la propuesta.';
    console.error('Error al consultar la propuesta del lead:', message);
    return {
      success: false,
      error: message,
      data: null,
    };
  }
}
