import prisma, { ensureDatabaseSchema } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@prisma/client';
import { LeadProposalEditor } from '@/components/proposals/lead-proposal-editor';
import {
  ArrowLeft,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Share2,
  Users,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Layers,
  FileCode,
  Award,
  Hash,
  ChevronDown,
  AtSign,
} from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;

  let lead = null;
  try {
    lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        socialProfiles: true,
        contacts: true,
        proposal: true,
      },
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2021') {
      await ensureDatabaseSchema();
      lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          socialProfiles: true,
          contacts: true,
          proposal: true,
        },
      });
    } else {
      throw error;
    }
  }

  if (!lead) {
    notFound();
  }

  const statusStyles: Record<LeadStatus, string> = {
    ENRICHED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    QUALIFIED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ENRICHING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    NEW: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    REJECTED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  const isSocialWebsite = lead.website && [
    'instagram.com',
    'facebook.com',
    'fb.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'google.com',
  ].some((d) => lead.website!.toLowerCase().includes(d));

  const locationStr = [lead.address, lead.city, lead.country].filter(Boolean).join(', ');

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navegación Superior y Estado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 gap-2 cursor-pointer'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Badge className={`px-3 py-1 text-xs font-semibold ${statusStyles[lead.status]}`}>
              {lead.status}
            </Badge>
            <Badge variant="outline" className="bg-zinc-900 text-zinc-300 border-zinc-800 px-3 py-1 gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              Lead Score: <span className="font-bold text-emerald-400">{lead.score}/100</span>
            </Badge>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Building2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lead.companyName}
                  </h1>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    {lead.niche}
                  </Badge>
                </div>
                {locationStr && (
                  <p className="text-zinc-400 text-xs flex items-center gap-1.5 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    {locationStr}
                  </p>
                )}
              </div>
            </div>

            {/* Acciones Rápidas (CTA Buttons) */}
            <div className="flex flex-wrap items-center gap-2">
              {lead.phoneE164 && (
                <a
                  href={`tel:${lead.phoneE164}`}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg px-4 py-2.5 shadow-lg shadow-emerald-500/10 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Llamar ({lead.phoneE164})
                </a>
              )}

              {lead.primaryEmail && (
                <a
                  href={`mailto:${lead.primaryEmail}`}
                  className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 rounded-lg px-4 py-2.5 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  Enviar Email
                </a>
              )}

              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-xs font-medium border rounded-lg px-4 py-2.5 transition-colors ${
                    isSocialWebsite
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
                      : 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
                  }`}
                >
                  {isSocialWebsite ? <Share2 className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                  <span>{isSocialWebsite ? 'Perfil Social' : 'Visitar Sitio Web'}</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Grid de 2 Columnas: Contacto & Scoring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1 y 2: Información General & Datos Directos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 space-y-5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  Información General y Contacto Directo
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" /> Teléfono E.164
                  </span>
                  {lead.phoneE164 ? (
                    <a href={`tel:${lead.phoneE164}`} className="text-sm font-mono font-medium text-emerald-400 hover:underline block pt-1">
                      {lead.phoneE164}
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500 pt-1">No disponible</p>
                  )}
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-400" /> Email Principal
                  </span>
                  {lead.primaryEmail ? (
                    <a href={`mailto:${lead.primaryEmail}`} className="text-sm font-medium text-zinc-200 hover:underline block pt-1 truncate">
                      {lead.primaryEmail}
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500 pt-1">No disponible</p>
                  )}
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" /> Sitio Web Oficial
                  </span>
                  {lead.website && !isSocialWebsite ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-400 hover:underline flex items-center gap-1 pt-1 truncate">
                      {lead.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500 pt-1">{isSocialWebsite ? 'Solo red social detectada' : 'Sin sitio web'}</p>
                  )}
                </div>

                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" /> Ubicación
                  </span>
                  <p className="text-sm text-zinc-300 pt-1 truncate">
                    {locationStr || 'No especificada'}
                  </p>
                </div>

                {lead.rating !== null && lead.rating !== undefined && (
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Rating Google Maps
                    </span>
                    <p className="text-sm text-zinc-200 pt-1 font-semibold">
                      ⭐ {lead.rating.toFixed(1)} {lead.reviewsCount !== null && lead.reviewsCount !== undefined && <span className="text-zinc-400 font-normal">({lead.reviewsCount.toLocaleString('es-ES')} reseñas)</span>}
                    </p>
                  </div>
                )}

                {lead.googleCategory && (
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-cyan-400" /> Categoría Google
                    </span>
                    <p className="text-sm text-zinc-300 pt-1">{lead.googleCategory}</p>
                  </div>
                )}
              </div>

              {/* Hash y Trazabilidad */}
              <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Lead Hash: <code className="text-zinc-300 font-mono text-[11px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{lead.leadHash}</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Registrado: {new Date(lead.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Lead Scoring & Auditoría de Calidad */}
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 space-y-5 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Auditoría de Calidad B2B
                </h3>
              </div>

              {/* Meter Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Puntuación Total</span>
                  <span className={`text-sm ${lead.score >= 70 ? 'text-emerald-400' : lead.score >= 40 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {lead.score} / 100
                  </span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      lead.score >= 70 ? 'bg-emerald-500' : lead.score >= 40 ? 'bg-amber-500' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, lead.score))}%` }}
                  />
                </div>
              </div>

              {/* Checklist de Parámetros Verificados */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Nombre de Empresa (+10)
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Verificado</Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${lead.phoneE164 ? 'text-emerald-400' : 'text-zinc-600'}`} /> Teléfono E.164 (+25)
                  </span>
                  {lead.phoneE164 ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">OK</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]">Falta</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${lead.primaryEmail ? 'text-emerald-400' : 'text-zinc-600'}`} /> Email Confirmado (+25)
                  </span>
                  {lead.primaryEmail ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">OK</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]">Falta</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${lead.website && !isSocialWebsite ? 'text-emerald-400' : 'text-zinc-600'}`} /> Sitio Web Oficial (+20)
                  </span>
                  {lead.website && !isSocialWebsite ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">OK</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]">Falta</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${lead.socialProfiles.length > 0 ? 'text-emerald-400' : 'text-zinc-600'}`} /> Redes Sociales (+20)
                  </span>
                  <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                    {lead.socialProfiles.length} Red(es)
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Copiloto de Ventas & Propuesta de Transformación con IA */}
        <LeadProposalEditor
          leadId={lead.id}
          initialProposal={lead.proposal}
        />

        {/* Bloque: Perfiles de Redes Sociales */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Share2 className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Perfiles de Redes Sociales ({lead.socialProfiles.length})</h2>
            </div>
          </div>

          {lead.socialProfiles.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">
              No se han vinculado perfiles sociales a este prospecto todavía.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lead.socialProfiles.map((profile) => (
                <div key={profile.id} className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-3 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-purple-400" />
                      <span className="font-semibold text-sm text-zinc-100 capitalize">{profile.platform}</span>
                    </div>
                    {profile.verified && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Verificado</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <a
                      href={profile.username ? `https://${profile.platform === 'TIKTOK' ? 'tiktok.com/@' : profile.platform === 'INSTAGRAM' ? 'instagram.com/' : profile.platform.toLowerCase() + '.com/'}${profile.username}` : profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-purple-400 hover:underline flex items-center gap-1 truncate"
                    >
                      <AtSign className="h-3 w-3 shrink-0" />
                      {profile.username ? `@${profile.username}` : profile.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    {profile.followers !== null && (
                      <p className="text-[11px] text-zinc-400">
                        Seguidores: <strong className="text-zinc-200">{profile.followers.toLocaleString('es-ES')}</strong>
                      </p>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-zinc-400 line-clamp-2 italic bg-zinc-900/60 p-2 rounded border border-zinc-800/60">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  )}

                  {profile.emailInBio && (
                    <p className="text-xs text-emerald-400 font-mono truncate">
                      Email Bio: {profile.emailInBio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bloque: Personas de Contacto / Ejecutivos */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Personas de Contacto & Decisores ({lead.contacts.length})</h2>
            </div>
          </div>

          {lead.contacts.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">
              No hay personas de contacto registradas para este prospecto.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.contacts.map((contact) => (
                <div key={contact.id} className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-sm">
                      {(contact.name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-100">{contact.name || 'Sin nombre'}</h4>
                      <p className="text-xs text-zinc-400">{contact.role || 'Rol no especificado'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-zinc-800/60">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-zinc-300 hover:text-emerald-400 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-zinc-500" /> {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="text-emerald-400 font-mono flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Accordeón Desplegable: Estructura de Datos Raw en PostgreSQL */}
        <details className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono group">
          <summary className="cursor-pointer font-bold text-zinc-400 hover:text-zinc-200 flex items-center justify-between list-none py-1">
            <span className="flex items-center gap-2 font-sans text-sm">
              <FileCode className="h-4 w-4 text-amber-400" />
              Estructura JSON Completa de PostgreSQL (Debug)
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-zinc-500" />
          </summary>
          <pre className="mt-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
            <code>{JSON.stringify(lead, null, 2)}</code>
          </pre>
        </details>
      </div>
    </main>
  );
}
