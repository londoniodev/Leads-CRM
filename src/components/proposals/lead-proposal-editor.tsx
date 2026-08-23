'use client';

import React, { useState, useTransition } from 'react';
import { LeadProposalEntity, UpdateProposalDTO } from '@/domain/proposals/proposal.types';
import { generateLeadProposalAction, saveLeadProposalAction } from '@/actions/proposal.actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles,
  Save,
  Copy,
  Check,
  RefreshCw,
  Send,
  Mail,
  PhoneCall,
  Target,
  Globe2,
  Bot,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';

interface LeadProposalEditorProps {
  leadId: string;
  initialProposal: LeadProposalEntity | null;
}

export function LeadProposalEditor({ leadId, initialProposal }: LeadProposalEditorProps) {
  const [proposal, setProposal] = useState<LeadProposalEntity | null>(initialProposal);
  const [formData, setFormData] = useState<UpdateProposalDTO>({
    painDiagnosis: initialProposal?.painDiagnosis || '',
    transformationGoal: initialProposal?.transformationGoal || '',
    pilar1Leads: initialProposal?.pilar1Leads || '',
    pilar2Conversion: initialProposal?.pilar2Conversion || '',
    pilar3Automation: initialProposal?.pilar3Automation || '',
    whatsappPitch: initialProposal?.whatsappPitch || '',
    coldEmailPitch: initialProposal?.coldEmailPitch || '',
    callScript: initialProposal?.callScript || '',
  });

  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'email' | 'call'>('whatsapp');
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (field: keyof UpdateProposalDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleGenerate = () => {
    startGenerateTransition(async () => {
      const res = await generateLeadProposalAction(leadId);
      if (!res.success || !res.data) {
        toast.error(res.error || 'No se pudo generar la propuesta con IA.');
        return;
      }

      setProposal(res.data);
      setFormData({
        painDiagnosis: res.data.painDiagnosis,
        transformationGoal: res.data.transformationGoal,
        pilar1Leads: res.data.pilar1Leads,
        pilar2Conversion: res.data.pilar2Conversion,
        pilar3Automation: res.data.pilar3Automation,
        whatsappPitch: res.data.whatsappPitch,
        coldEmailPitch: res.data.coldEmailPitch,
        callScript: res.data.callScript,
      });
      setIsDirty(false);
      toast.success('Propuesta de transformación generada con éxito.');
    });
  };

  const handleSave = () => {
    startSaveTransition(async () => {
      const res = await saveLeadProposalAction(leadId, formData);
      if (!res.success || !res.data) {
        toast.error(res.error || 'Error al guardar los cambios.');
        return;
      }

      setProposal(res.data);
      setIsDirty(false);
      toast.success('Propuesta guardada correctamente.');
    });
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Mensaje copiado al portapapeles.');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <section className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Glow ambiental decorativo */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header del Copiloto */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Copiloto de Ventas & Propuesta de Transformación
              </h2>
              <p className="text-xs text-zinc-400">
                Estrategia basada en el dolor del dueño, libertad de tiempo y los 3 Pilares de Crecimiento.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          {proposal && (
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-1 gap-1.5 ${
                proposal.isCustomized || isDirty
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isDirty ? (
                <>
                  <AlertCircle className="h-3 w-3 text-amber-400" /> Cambios sin guardar
                </>
              ) : proposal.isCustomized ? (
                'Personalizada por ti'
              ) : (
                'Generada con IA'
              )}
            </Badge>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isSaving}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Analizando con IA...
              </>
            ) : proposal ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerar con IA
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                Generar Propuesta con IA
              </>
            )}
          </Button>

          {proposal && (
            <Button
              onClick={handleSave}
              disabled={isGenerating || isSaving || !isDirty}
              size="sm"
              variant="outline"
              className="bg-zinc-950 border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-blue-400" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!proposal ? (
        /* Empty State */
        <div className="py-12 px-6 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200">
              Aún no has generado una propuesta para este cliente
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Haz clic en <strong>&quot;Generar Propuesta con IA&quot;</strong> para que el motor analice la presencia digital, nicho y datos del prospecto y elabore una estrategia personalizada 100% editable.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generando propuesta...
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                Generar Ahora
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Formulario Editable */
        <div className="space-y-6">
          {/* Bloque 1: Diagnóstico del Dolor y Transformación Deseada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950/70 border border-rose-500/20 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="h-3.5 w-3.5" />
                Diagnóstico del Dolor Actual (Fuga de Clientes/Tiempo)
              </label>
              <p className="text-[11px] text-zinc-500">
                Dónde está sufriendo el negocio hoy (falta de previsibilidad, saturación del dueño):
              </p>
              <Textarea
                value={formData.painDiagnosis}
                onChange={(e) => handleInputChange('painDiagnosis', e.target.value)}
                className="bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 min-h-[90px] focus-visible:border-rose-500/50 leading-relaxed"
                placeholder="Describe el dolor principal del prospecto..."
              />
            </div>

            <div className="bg-zinc-950/70 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Target className="h-3.5 w-3.5" />
                Transformación Deseada (Libertad, Escala y Paz)
              </label>
              <p className="text-[11px] text-zinc-500">
                El resultado humano y financiero que le prometemos alcanzar:
              </p>
              <Textarea
                value={formData.transformationGoal}
                onChange={(e) => handleInputChange('transformationGoal', e.target.value)}
                className="bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 min-h-[90px] focus-visible:border-emerald-500/50 leading-relaxed"
                placeholder="Describe el objetivo y transformación que busca el dueño..."
              />
            </div>
          </div>

          {/* Bloque 2: Los 3 Pilares de Solución */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Estrategia de los 3 Pilares para este Negocio
              </h3>
              <span className="text-[11px] text-zinc-500">
                Solución de negocio (no venta técnica)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Pilar 1 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">1. Generación de Leads</h4>
                    <span className="text-[10px] text-blue-400">Atracción visual de alto impacto</span>
                  </div>
                </div>
                <Textarea
                  value={formData.pilar1Leads}
                  onChange={(e) => handleInputChange('pilar1Leads', e.target.value)}
                  className="bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 min-h-[100px] leading-relaxed"
                  placeholder="Detalle del Pilar 1..."
                />
              </div>

              {/* Pilar 2 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">2. Máquina de Conversión</h4>
                    <span className="text-[10px] text-indigo-400">Landing / Web de alta autoridad</span>
                  </div>
                </div>
                <Textarea
                  value={formData.pilar2Conversion}
                  onChange={(e) => handleInputChange('pilar2Conversion', e.target.value)}
                  className="bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 min-h-[100px] leading-relaxed"
                  placeholder="Detalle del Pilar 2..."
                />
              </div>

              {/* Pilar 3 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">3. Agente IA 24/7</h4>
                    <span className="text-[10px] text-purple-400">Calificación y cierre automático</span>
                  </div>
                </div>
                <Textarea
                  value={formData.pilar3Automation}
                  onChange={(e) => handleInputChange('pilar3Automation', e.target.value)}
                  className="bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 min-h-[100px] leading-relaxed"
                  placeholder="Detalle del Pilar 3..."
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Canales de Outreach Listos para Enviar */}
          <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Send className="h-3.5 w-3.5 text-emerald-400" />
                  Pitches Listos para Enviar (Editables)
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Selecciona el canal, personaliza el texto si lo deseas y cópialo con 1 clic.
                </p>
              </div>

              {/* Selector de Canales */}
              <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveChannel('whatsapp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeChannel === 'whatsapp'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Send className="h-3 w-3" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('email')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeChannel === 'email'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Mail className="h-3 w-3" /> Email en Frío
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('call')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeChannel === 'call'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <PhoneCall className="h-3 w-3" /> Guion Telefónico
                </button>
              </div>
            </div>

            {/* Contenido del Canal Activo */}
            <div className="space-y-3">
              {activeChannel === 'whatsapp' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-emerald-400" /> Mensaje Directo para WhatsApp
                    </span>
                    <Button
                      onClick={() => handleCopy(formData.whatsappPitch || '', 'whatsapp')}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200 gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'whatsapp' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copiar Mensaje
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.whatsappPitch}
                    onChange={(e) => handleInputChange('whatsappPitch', e.target.value)}
                    className="bg-zinc-900 font-sans text-xs text-zinc-200 min-h-[140px] leading-relaxed border-zinc-800"
                    placeholder="Escribe o ajusta el mensaje de WhatsApp..."
                  />
                </div>
              )}

              {activeChannel === 'email' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-400" /> Correo Electrónico Personalizado
                    </span>
                    <Button
                      onClick={() => handleCopy(formData.coldEmailPitch || '', 'email')}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200 gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'email' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copiar Correo
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.coldEmailPitch}
                    onChange={(e) => handleInputChange('coldEmailPitch', e.target.value)}
                    className="bg-zinc-900 font-sans text-xs text-zinc-200 min-h-[160px] leading-relaxed border-zinc-800"
                    placeholder="Escribe o ajusta el email en frío..."
                  />
                </div>
              )}

              {activeChannel === 'call' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                      <PhoneCall className="h-3.5 w-3.5 text-purple-400" /> Guion de Llamada (45 Segundos)
                    </span>
                    <Button
                      onClick={() => handleCopy(formData.callScript || '', 'call')}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200 gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'call' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copiar Guion
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.callScript}
                    onChange={(e) => handleInputChange('callScript', e.target.value)}
                    className="bg-zinc-900 font-sans text-xs text-zinc-200 min-h-[140px] leading-relaxed border-zinc-800"
                    placeholder="Escribe o ajusta el guion de llamada..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer de Trazabilidad */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Última actualización:{' '}
                {new Date(proposal.updatedAt || proposal.generatedAt).toLocaleString('es-ES')}
              </span>
            </div>
            {isDirty && (
              <span className="text-amber-400 font-medium">
                Recuerda presionar &quot;Guardar Cambios&quot; para persistir en la base de datos.
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
