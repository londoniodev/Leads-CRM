'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Lead, LeadStatus, SocialProfile, ContactPerson } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateLeadStatus, deleteLead, enrichLeadSocials } from '@/actions/lead.actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, ExternalLink, Globe, CheckCircle2, Clock, XCircle, Sparkles, Eye, Share2, Trash2, Search } from 'lucide-react';
import { useTransition } from 'react';

// Extender el tipo de Lead para incluir relaciones opcionales
export type LeadWithRelations = Lead & {
  rawPhone?: string | null;
  socialProfiles?: SocialProfile[];
  contacts?: ContactPerson[];
};

// Componente helper para la celda de acciones interactiva
function ActionsCell({ lead }: { lead: LeadWithRelations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: LeadStatus) => {
    startTransition(async () => {
      await updateLeadStatus(lead.id, newStatus);
    });
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar el lead "${lead.companyName}"?`)) {
      startTransition(async () => {
        await deleteLead(lead.id);
      });
    }
  };

  const handleEnrichSocials = () => {
    startTransition(async () => {
      const res = await enrichLeadSocials(lead.id);
      if (res?.success) {
        alert('Enriquecimiento encolado...');
      } else {
        alert(res?.error || 'Error al encolar enriquecimiento.');
      }
    });
  };

  const handleNavigateDetail = () => {
    if (lead.id) {
      router.push(`/leads/${lead.id}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer outline-none"
        disabled={isPending}
      >
        <span className="sr-only">Abrir menú</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 w-52 font-sans">
        <DropdownMenuLabel className="text-zinc-400 text-xs font-semibold">Navegación</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleNavigateDetail}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-zinc-200 text-xs"
        >
          <Eye className="h-3.5 w-3.5 text-emerald-400" /> Ver Detalle
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleEnrichSocials}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-purple-400 text-xs font-medium"
        >
          <Search className="h-3.5 w-3.5" /> Buscar Redes Sociales
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuLabel className="text-zinc-400 text-xs font-semibold">Cambiar Estado</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.ENRICHED)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-emerald-400 text-xs"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Marcar ENRICHED
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.QUALIFIED)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-blue-400 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" /> Marcar QUALIFIED
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.NEW)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-zinc-300 text-xs"
        >
          <Clock className="h-3.5 w-3.5 text-zinc-400" /> Marcar NEW
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.REJECTED)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-rose-400 text-xs"
        >
          <XCircle className="h-3.5 w-3.5" /> Marcar REJECTED
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={handleDelete}
          className="hover:bg-rose-950/40 text-rose-400 cursor-pointer flex items-center gap-2 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar Lead
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<LeadWithRelations>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos los elementos de la página"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'companyName',
    header: 'Empresa / Sitio Web',
    cell: ({ row }) => {
      const companyName = row.getValue('companyName') as string;
      const website = row.original.website;
      const leadId = row.original.id;

      const isSocialDomain = website && [
        'instagram.com',
        'facebook.com',
        'fb.com',
        'linkedin.com',
        'twitter.com',
        'x.com',
        'tiktok.com',
        'google.com',
      ].some((domain) => website.toLowerCase().includes(domain));

      return (
        <div className="flex flex-col">
          <Link href={`/leads/${leadId}`} className="font-semibold text-zinc-100 hover:text-emerald-400 transition-colors">
            {companyName}
          </Link>
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs flex items-center gap-1 mt-0.5 truncate max-w-[240px] hover:underline ${
                isSocialDomain ? 'text-purple-400' : 'text-blue-400'
              }`}
            >
              {isSocialDomain ? <Share2 className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
              {isSocialDomain ? 'Perfil Social' : website.replace(/^https?:\/\//, '')}
              <ExternalLink className="h-2.5 w-2.5 opacity-70" />
            </a>
          ) : (
            <span className="text-xs text-zinc-500">Sin sitio web</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'niche',
    header: 'Nicho',
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const niche = (row.getValue(columnId) as string || '').toLowerCase();
      return niche.includes(String(filterValue).toLowerCase());
    },
    cell: ({ row }) => {
      const niche = row.getValue('niche') as string;
      return (
        <Badge variant="outline" className="bg-zinc-800/80 text-zinc-300 border-zinc-700 font-normal">
          {niche}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'Ubicación',
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const city = (row.original.city || '').toLowerCase();
      const country = (row.original.country || '').toLowerCase();
      const search = String(filterValue).toLowerCase();
      return city.includes(search) || country.includes(search);
    },
    cell: ({ row }) => {
      const city = row.original.city;
      const country = row.original.country;
      const locationStr = [city, country].filter(Boolean).join(', ');
      return <span className="text-sm text-zinc-400">{locationStr || 'No especificada'}</span>;
    },
  },
  {
    accessorKey: 'score',
    header: 'Score',
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === undefined || filterValue === null || filterValue === '') return true;
      const minScore = Number(filterValue) || 0;
      return (row.getValue(columnId) as number) >= minScore;
    },
    cell: ({ row }) => {
      const score = row.getValue('score') as number;
      return (
        <div className="flex items-center gap-1">
          <span className={`font-semibold text-sm ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-zinc-400'}`}>
            {score}
          </span>
          <span className="text-xs text-zinc-500">/100</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell lead={row.original} />,
  },
];
