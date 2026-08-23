import { IPromptStrategy, LeadBusinessContext } from '@/domain/proposals/proposal.types';

export class ThreePillarsTransformationStrategy implements IPromptStrategy {
  buildSystemPrompt(): string {
    return `Eres un estratega senior de crecimiento de negocios y consultor de ventas B2B de alto impacto.
Tu misión principal es analizar a un cliente potencial (lead) y construir una propuesta de alto valor enfocada en:
1. EL DOLOR REAL DEL DUEÑO: Falta de predictibilidad en ventas, pérdida de tiempo contestando mensajes a deshoras, dependencia del boca a boca, fuga de clientes potenciales y sobrecarga de trabajo.
2. LA TRANSFORMACIÓN DESEADA: Escalar la facturación de forma estable, automatizar la prospección, recuperar tiempo de calidad con su familia y tener paz mental.

REGLAS FUNDAMENTALES (ESTRICTAS):
- NUNCA vendas "software", "SaaS", "código", "APIs", "tecnología" ni "herramientas técnicas". Vende RESULTADOS, TIEMPO, PREDICTIBILIDAD Y CRECIMIENTO.
- NO sobreponderes comentarios o reseñas negativas aisladas (pueden ser casos atípicos); enfócate en el potencial de su nicho, su presencia digital actual y la brecha de conversión.
- La solución SIEMPRE se articula bajo los siguientes 3 PILARES:
  * Pilar 1 (Generación de Leads): Campañas visuales de alto impacto que captan la atención en los primeros segundos y atraen exclusivamente clientes calificados.
  * Pilar 2 (Máquina de Conversión): Landing page / Sitio web de alta conversión que genera autoridad instantánea, educa y filtra a los curiosos para entregar solo prospectos listos para comprar.
  * Pilar 3 (Agente IA 24/7 de Calificación y Cierre): Chatbot inteligente que perfila en tiempo real, responde preguntas frecuentes al instante, hace seguimiento oportuno y agenda citas o cierra ventas sin que el dueño tenga que estar pegado al celular.

DEBES RESPONDER EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "painDiagnosis": "Diagnóstico detallado y empático del dolor actual del negocio (dónde están perdiendo clientes y tiempo)",
  "transformationGoal": "La transformación humana y de negocio que lograrán (más ventas, menos estrés, tiempo libre)",
  "pilar1Leads": "Cómo aplicará exactamente el Pilar 1 de atracción visual a su nicho específico",
  "pilar2Conversion": "Cómo aplicará el Pilar 2 de Landing Page de alta conversión para su nicho",
  "pilar3Automation": "Cómo el Pilar 3 del Chatbot IA calificará y atenderá a sus clientes 24/7",
  "whatsappPitch": "Mensaje de WhatsApp conversacional, directo, persuasivo y listo para enviar",
  "coldEmailPitch": "Email en frío con asunto magnético y cuerpo enfocado en ROI y libertad de tiempo",
  "callScript": "Guion telefónico de 45 segundos con gancho de entrada, propuesta de valor y llamada a la acción"
}`;
  }

  buildUserPrompt(context: LeadBusinessContext): string {
    const socialSummary = context.socialProfiles.length > 0
      ? context.socialProfiles.map((p) => `- ${p.platform}: ${p.username ? `@${p.username}` : ''} ${p.followers ? `(${p.followers.toLocaleString()} seguidores)` : ''} ${p.bio ? `Bio: "${p.bio}"` : ''}`).join('\n')
      : 'No se encontraron perfiles sociales vinculados';

    const contactsSummary = context.contacts.length > 0
      ? context.contacts.map((c) => `- ${c.name || 'Contacto'} (${c.role || 'Rol no especificado'}): ${c.email || ''} ${c.phone || ''}`).join('\n')
      : 'Sin decisores identificados previamente';

    return `Analiza a profundidad este prospecto y genera la propuesta personalizada:

DATOS DEL PROSPECTO:
- Empresa: ${context.companyName}
- Nicho / Categoría: ${context.niche} ${context.googleCategory ? `(${context.googleCategory})` : ''}
- Ubicación: ${[context.address, context.city, context.country].filter(Boolean).join(', ') || 'No especificada'}
- Sitio Web: ${context.website || 'No dispone de sitio web oficial (depende 100% de redes o mapa)'}
- Teléfono: ${context.phoneE164 || 'No disponible'}
- Email: ${context.primaryEmail || 'No disponible'}
- Datos de Google Maps: ${context.rating ? `Calificación: ${context.rating} ⭐ (${context.reviewsCount ?? 0} reseñas)` : 'Sin perfil de Google Maps'}

REDES SOCIALES DETECTADAS:
${socialSummary}

DECISORES / CONTACTOS:
${contactsSummary}

Por favor, genera la propuesta en formato JSON válido siguiendo los 3 Pilares y centrándote en la transformación y dolor del dueño.`;
  }
}
