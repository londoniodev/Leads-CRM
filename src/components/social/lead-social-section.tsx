'use client';

import React, { useTransition } from 'react';
import { SocialProfile } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { enrichLeadSocials } from '@/actions/lead.actions';
import { toast } from 'sonner';
import {
  Share2,
  Users,
  Search,
  ExternalLink,
  AtSign,
  Mail,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Radio,
} from 'lucide-react';

interface LeadSocialSectionProps {
  leadId: string;
  companyName: string;
  website: string | null;
  socialProfiles: SocialProfile[];
}

export function LeadSocialSection({
  leadId,
  companyName,
  website,
  socialProfiles,
}: LeadSocialSectionProps) {
  const [isPending, startTransition] = useTransition();

  const handleEnrich = () => {
    startTransition(async () => {
      const res = await enrichLeadSocials(leadId);
      if (res?.success) {
        toast.success('Rastreo de redes sociales encolado con éxito.');
      } else {
        toast.error(res?.error || 'Error al iniciar rastreo de redes.');
      }
    });
  };

  const getSocialProfileUrl = (profile: { platform: string; username?: string | null; url: string }) => {
    if (profile.username) {
      const cleanUsername = profile.username.replace(/^@/, '');
      switch (profile.platform) {
        case 'TIKTOK':
          return `https://tiktok.com/@${cleanUsername}`;
        case 'INSTAGRAM':
          return `https://instagram.com/${cleanUsername}`;
        case 'FACEBOOK':
          return `https://facebook.com/${cleanUsername}`;
        case 'LINKEDIN':
          return profile.url || `https://linkedin.com/company/${cleanUsername}`;
        default:
          return profile.url;
      }
    }
    return profile.url;
  };

  // Calcular métricas agregadas
  const totalFollowers = socialProfiles.reduce((acc, p) => acc + (p.followers || 0), 0);
  const verifiedCount = socialProfiles.filter((p) => p.verified).length;

  const isSocialWebsite = website && [
    'instagram.com',
    'facebook.com',
    'fb.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'google.com',
  ].some((d) => website.toLowerCase().includes(d));

  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
        return {
          border: 'hover:border-pink-500/50 border-pink-500/20',
          badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          accent: 'text-pink-400',
          bg: 'from-pink-950/20 to-zinc-950/80',
        };
      case 'TIKTOK':
        return {
          border: 'hover:border-cyan-500/50 border-cyan-500/20',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          accent: 'text-cyan-400',
          bg: 'from-cyan-950/20 to-zinc-950/80',
        };
      case 'FACEBOOK':
        return {
          border: 'hover:border-blue-500/50 border-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          accent: 'text-blue-400',
          bg: 'from-blue-950/20 to-zinc-950/80',
        };
      case 'LINKEDIN':
        return {
          border: 'hover:border-sky-500/50 border-sky-500/20',
          badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          accent: 'text-sky-400',
          bg: 'from-sky-950/20 to-zinc-950/80',
        };
      default:
        return {
          border: 'hover:border-purple-500/50 border-zinc-800/80',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          accent: 'text-purple-400',
          bg: 'from-zinc-900/40 to-zinc-950/80',
        };
    }
  };

  return (
    <div className="pt-5 border-t border-zinc-800/80 space-y-4">
      {/* Header con botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-purple-400" />
            Presencia & Estadísticas de Redes Sociales ({socialProfiles.length})
          </h4>
          <p className="text-[11px] text-zinc-500 pt-0.5">
            Audiencia, seguidores y perfiles indexados para este prospecto.
          </p>
        </div>

        <Button
          onClick={handleEnrich}
          disabled={isPending}
          variant="outline"
          size="sm"
          className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 text-xs gap-1.5 h-8 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          {isPending ? 'Rastreando...' : 'Buscar Redes con IA / Apify'}
        </Button>
      </div>

      {/* KPI Stats Bar si hay redes o datos */}
      {socialProfiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Total Audiencia</span>
              <p className="text-sm font-bold text-zinc-100">
                {totalFollowers > 0 ? totalFollowers.toLocaleString('es-ES') : '0'}
                <span className="text-[11px] font-normal text-zinc-400 ml-1">seguidores</span>
              </p>
            </div>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Radio className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Canales Activos</span>
              <p className="text-sm font-bold text-zinc-100">
                {socialProfiles.length} <span className="text-[11px] font-normal text-zinc-400">red(es)</span>
              </p>
            </div>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Verificación</span>
              <p className="text-sm font-bold text-zinc-100">
                {verifiedCount > 0 ? `${verifiedCount} Verificado(s)` : 'Estándar'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista / Grid de Redes Sociales */}
      {socialProfiles.length === 0 ? (
        <div className="bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl p-5 text-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <p className="text-xs font-semibold text-zinc-300">
              No hay perfiles ni estadísticas de redes sociales vinculadas aún
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Haz clic en <strong>&ldquo;Buscar Redes con IA / Apify&rdquo;</strong> para rastrear Google, Instagram, TikTok y Facebook automáticamente para este prospecto.
            </p>
          </div>
          {isSocialWebsite && (
            <div className="pt-2">
              <span className="text-[11px] text-purple-400 font-medium block">
                💡 Se detectó una red social en el sitio web oficial:
              </span>
              <a
                href={website!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-mono pt-1"
              >
                {website}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {socialProfiles.map((profile) => {
            const profileUrl = getSocialProfileUrl(profile);
            const style = getPlatformStyle(profile.platform);

            return (
              <a
                key={profile.id}
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-b ${style.bg} border ${style.border} rounded-xl p-4 space-y-3 transition-all group block cursor-pointer hover:shadow-lg`}
              >
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 capitalize ${style.badge}`}>
                    {profile.platform.toLowerCase().replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {profile.verified && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] px-1.5 py-0">
                        Verificado
                      </Badge>
                    )}
                    <ExternalLink className={`h-3 w-3 ${style.accent} opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
                  </div>
                </div>

                {/* Handle / Usuario */}
                <div className="space-y-1.5">
                  <p className="text-xs font-mono font-medium text-zinc-100 group-hover:underline truncate flex items-center gap-1">
                    <AtSign className="h-3 w-3 shrink-0 text-zinc-400" />
                    {profile.username ? profile.username.replace(/^@/, '') : profile.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </p>

                  {/* Estadísticas de Seguidores */}
                  <div className="bg-zinc-950/80 rounded-lg p-2 border border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Seguidores</span>
                    {profile.followers !== null && profile.followers !== undefined ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {profile.followers.toLocaleString('es-ES')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 italic">Pendiente de extracción</span>
                    )}
                  </div>
                </div>

                {/* Biografía si existe */}
                {profile.bio && (
                  <p className="text-[11px] text-zinc-400 line-clamp-2 italic bg-zinc-950/60 p-2 rounded border border-zinc-800/60">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}

                {/* Email en Bio si existe */}
                {profile.emailInBio && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono pt-1 border-t border-zinc-800/60">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{profile.emailInBio}</span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
