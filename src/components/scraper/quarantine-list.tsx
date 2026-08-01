'use client';

import * as React from 'react';
import {
  getConflictedProfilesWithCandidates,
  resolveConflictedProfile,
  ConflictedProfileWithCandidates,
} from '@/actions/social.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export function QuarantineList() {
  const [profiles, setProfiles] = React.useState<ConflictedProfileWithCandidates[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLeads, setSelectedLeads] = React.useState<Record<string, string>>({});
  const [pendingProfiles, setPendingProfiles] = React.useState<Record<string, boolean>>({});

  const fetchProfiles = React.useCallback(async () => {
    setLoading(true);
    const res = await getConflictedProfilesWithCandidates();
    if (res.success && res.data) {
      setProfiles(res.data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleResolve = async (profileId: string) => {
    const selectedLeadId = selectedLeads[profileId];
    if (!selectedLeadId) {
      toast.error('Por favor selecciona un Lead candidato para vincular.');
      return;
    }

    setPendingProfiles((prev) => ({ ...prev, [profileId]: true }));
    const res = await resolveConflictedProfile(profileId, selectedLeadId);

    if (res.success) {
      toast.success('Perfil social vinculado exitosamente al Lead.');
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } else {
      toast.error(res.error || 'Error al vincular el perfil.');
    }

    setPendingProfiles((prev) => ({ ...prev, [profileId]: false }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2 font-sans">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        <span className="text-xs">Cargando perfiles en cuarentena...</span>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2 border border-dashed border-zinc-800 rounded-lg p-6 font-sans">
        <ShieldAlert className="h-8 w-8 text-emerald-500/50" />
        <p className="text-sm font-semibold text-zinc-300">Sin Perfiles en Conflicto</p>
        <p className="text-xs text-zinc-500 max-w-xs">
          Todos los perfiles sociales rascados se han vinculado limpiamente a sus respectivos Leads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          {profiles.length} perfil(es) en cuarentena
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchProfiles}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <RefreshCw className="h-3 w-3 mr-1" /> Refrescar
        </Button>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {profiles.map((profile) => {
          const isPending = Boolean(pendingProfiles[profile.id]);
          const currentSelected = selectedLeads[profile.id] || '';

          return (
            <div
              key={profile.id}
              className="p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs space-y-3 hover:border-zinc-700 transition-colors shadow-sm"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] uppercase">
                    {profile.platform}
                  </Badge>
                  @{profile.username || 'sin_handle'}
                </span>
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Ver perfil <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* Detalle y Razón del conflicto */}
              {profile.bio && (
                <p className="text-zinc-300 text-[11px] bg-zinc-900/60 p-2 rounded border border-zinc-800/60 line-clamp-2">
                  {profile.bio}
                </p>
              )}

              <p className="text-zinc-400 text-[11px]">
                <strong className="text-amber-400">Motivo:</strong> {profile.conflictNote || 'Ambigüedad en resolución.'}
              </p>

              {/* Selector de Lead Candidato + Botón Vincular */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-300 block">
                  Seleccionar Lead Sugerido:
                </span>

                <div className="flex items-center gap-2">
                  <Select
                    value={currentSelected}
                    onValueChange={(val) => {
                      if (val) {
                        setSelectedLeads((prev) => ({ ...prev, [profile.id]: val }));
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8 text-xs flex-1">
                      <SelectValue placeholder="Elegir empresa candidato..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      {profile.candidateLeads.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id} className="text-xs">
                          {candidate.companyName} {candidate.city ? `(${candidate.city})` : ''} {candidate.phoneE164 ? `- ${candidate.phoneE164}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    onClick={() => handleResolve(profile.id)}
                    disabled={isPending || !currentSelected}
                    className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 px-3 shrink-0"
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LinkIcon className="h-3 w-3" />
                    )}
                    Vincular
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
