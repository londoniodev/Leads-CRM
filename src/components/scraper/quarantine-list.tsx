'use client';

import * as React from 'react';
import { getConflictedSocialProfiles } from '@/actions/lead.actions';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuarantineList() {
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchProfiles = React.useCallback(async () => {
    setLoading(true);
    const res = await getConflictedSocialProfiles();
    if (res.success && res.data) {
      setProfiles(res.data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="p-3 bg-zinc-950/80 border border-zinc-800/90 rounded-lg text-xs space-y-1.5 hover:border-zinc-700 transition-colors"
          >
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

            <p className="text-zinc-400 text-[11px] leading-relaxed">
              <strong className="text-amber-300">Razón:</strong> {profile.conflictNote || 'Ambigüedad en resolución de identidad.'}
            </p>

            {profile.followers !== null && (
              <span className="text-[10px] text-zinc-500 block">
                Seguidores: {profile.followers.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
