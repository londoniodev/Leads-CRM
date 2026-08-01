import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@prisma/client';
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
  ShieldCheck,
  Calendar,
  Clock,
  Layers,
  FileCode,
} from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      socialProfiles: true,
      contacts: true,
    },
  });

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

  const locationStr = [lead.address, lead.city, lead.country].filter(Boolean).join(', ');

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navegación Superior / Botón Volver */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 gap-2'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1 text-xs font-semibold ${statusStyles[lead.status]}`}>
              {lead.status}
            </Badge>
            <Badge variant="outline" className="bg-zinc-900 text-zinc-300 border-zinc-800 px-3 py-1">
              Score: <span className="font-bold ml-1 text-emerald-400">{lead.score}/100</span>
            </Badge>
          </div>
        </div>

        {/* Cabecera Principal del Lead */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">{lead.companyName}</h1>
              </div>
              <p className="text-zinc-400 text-sm flex items-center gap-2 pt-1">
                <Layers className="h-4 w-4 text-zinc-500" />
                Nicho / Sector: <span className="text-zinc-200 font-medium">{lead.niche}</span>
              </p>
            </div>

            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-colors w-fit"
              >
                <Globe className="h-4 w-4" />
                <span>{lead.website.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}
          </div>
        </div>

        {/* Bloque 1: Resumen Ejecutivo y Metadatos (typeset) */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Resumen y Metadatos del Prospecto</h2>
          </div>

          <div className="typeset">
            <h3>Información General de la Empresa</h3>
            <p>
              Prospecto B2B clasificado en el sector <strong>{lead.niche}</strong>. Identificador único de trazabilidad en base de datos: <code>{lead.id}</code>.
            </p>

            <ul>
              <li>
                <strong>Email Principal:</strong>{' '}
                {lead.primaryEmail ? (
                  <a href={`mailto:${lead.primaryEmail}`}>{lead.primaryEmail}</a>
                ) : (
                  'No registrado'
                )}
              </li>
              <li>
                <strong>Teléfono E.164:</strong>{' '}
                {lead.phoneE164 ? (
                  <a href={`tel:${lead.phoneE164}`}>{lead.phoneE164}</a>
                ) : (
                  'No registrado'
                )}
              </li>
              <li>
                <strong>Ubicación Geográfica:</strong> {locationStr || 'Sin especificación'}
              </li>
              <li>
                <strong>Hash de Origen:</strong> <code>{lead.leadHash}</code>
              </li>
            </ul>

            <hr />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose text-sm text-zinc-400 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>Creado: {new Date(lead.createdAt).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span>Actualizado: {new Date(lead.updatedAt).toLocaleString('es-ES')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bloque 2: Perfiles Sociales Enriquecidos (typeset-docs) */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Share2 className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Perfiles de Redes Sociales</h2>
          </div>

          <div className="typeset-docs">
            {lead.socialProfiles.length === 0 ? (
              <p>No hay perfiles sociales vinculados actualmente a este lead.</p>
            ) : (
              <>
                <p>
                  A continuación se detallan los <strong>{lead.socialProfiles.length}</strong> perfiles sociales detectados y analizados por los conectores de extracción:
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Plataforma</th>
                      <th>Usuario / Enlace</th>
                      <th>Seguidores</th>
                      <th>Verificado</th>
                      <th>Bio / Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.socialProfiles.map((profile) => (
                      <tr key={profile.id}>
                        <td>
                          <strong>{profile.platform}</strong>
                        </td>
                        <td>
                          <a href={profile.url} target="_blank" rel="noopener noreferrer">
                            {profile.username ? `@${profile.username}` : profile.url}
                          </a>
                        </td>
                        <td>{profile.followers !== null ? profile.followers.toLocaleString('es-ES') : '-'}</td>
                        <td>{profile.verified ? 'Verificado' : 'No'}</td>
                        <td>
                          {profile.bio ? <span>{profile.bio}</span> : <em className="opacity-60">Sin bio</em>}
                          {profile.emailInBio && (
                            <div className="text-xs text-emerald-400 mt-1">
                              Email bio: {profile.emailInBio}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </section>

        {/* Bloque 3: Personas de Contacto (typeset-docs) */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Users className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Personas de Contacto</h2>
          </div>

          <div className="typeset-docs">
            {lead.contacts.length === 0 ? (
              <p>No se han registrado ejecutivos ni contactos clave para este prospecto.</p>
            ) : (
              <>
                <p>
                  Registros de decisores y directivos asociados a <strong>{lead.companyName}</strong>:
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Cargo / Rol</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>
                          <strong>{contact.name || 'Sin nombre'}</strong>
                        </td>
                        <td>{contact.role || 'No especificado'}</td>
                        <td>
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {contact.phone ? (
                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </section>

        {/* Bloque 4: Renderizado de Payload JSON de Debug / Typeset Stream (typeset-docs) */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <FileCode className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Estructura de Datos Relacional (PostgreSQL Raw)</h2>
          </div>

          <div className="typeset-docs">
            <p>
              Previsualización estructurada del objeto <code>Lead</code> extraído de la base de datos PostgreSQL:
            </p>
            <pre>
              <code>{JSON.stringify(lead, null, 2)}</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
