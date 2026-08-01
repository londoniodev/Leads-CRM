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
import { updateLeadStatus } from '@/actions/lead.actions';
import Link from 'next/link';
import { MoreHorizontal, ExternalLink, Globe, Phone, Mail, CheckCircle2, Clock, XCircle, Sparkles, Eye } from 'lucide-react';
import { useTransition } from 'react';

// Extender el tipo de Lead para incluir relaciones opcionales
export type LeadWithRelations = Lead & {
  socialProfiles?: SocialProfile[];
  contacts?: ContactPerson[];
};

// Componente helper para la celda de acciones interactiva
function ActionsCell({ lead }: { lead: LeadWithRelations }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: LeadStatus) => {
    startTransition(async () => {
      await updateLeadStatus(lead.id, newStatus);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md inline-flex items-center justify-center transition-colors cursor-pointer outline-none" disabled={isPending}>
        <span className="sr-only">Abrir menú</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 w-48">
        <DropdownMenuLabel className="text-zinc-400 text-xs font-semibold">Navegación</DropdownMenuLabel>
        <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-200 p-0">
          <Link href={`/leads/${lead.id}`} className="flex items-center gap-2 w-full px-1.5 py-1">
            <Eye className="h-3.5 w-3.5 text-emerald-400" /> Ver Detalle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuLabel className="text-zinc-400 text-xs font-semibold">Cambiar Estado</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.ENRICHED)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Marcar ENRICHED
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.QUALIFIED)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-blue-400"
        >
          <Sparkles className="h-3.5 w-3.5" /> Marcar QUALIFIED
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.NEW)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-zinc-300"
        >
          <Clock className="h-3.5 w-3.5 text-zinc-400" /> Marcar NEW
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(LeadStatus.REJECTED)}
          className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-rose-400"
        >
          <XCircle className="h-3.5 w-3.5" /> Marcar REJECTED
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
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[220px]"
            >
              <Globe className="h-3 w-3" />
              {website.replace(/^https?:\/\//, '')}
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
    cell: ({ row }) => {
      const city = row.original.city;
      const country = row.original.country;
      const locationStr = [city, country].filter(Boolean).join(', ');
      return <span className="text-sm text-zinc-400">{locationStr || 'No especificada'}</span>;
    },
  },
  {
    accessorKey: 'phoneE164',
    header: 'Teléfono E.164',
    cell: ({ row }) => {
      const phone = row.getValue('phoneE164') as string | null;
      if (!phone) return <span className="text-xs text-zinc-600">-</span>;
      return (
        <a href={`tel:${phone}`} className="text-sm font-mono text-emerald-400/90 hover:underline flex items-center gap-1.5">
          <Phone className="h-3 w-3" />
          {phone}
        </a>
      );
    },
  },
  {
    accessorKey: 'primaryEmail',
    header: 'Email Principal',
    cell: ({ row }) => {
      const email = row.getValue('primaryEmail') as string | null;
      if (!email) return <span className="text-xs text-zinc-600">-</span>;
      return (
        <a href={`mailto:${email}`} className="text-sm text-zinc-300 hover:underline flex items-center gap-1.5">
          <Mail className="h-3 w-3 text-zinc-400" />
          {email}
        </a>
      );
    },
  },
  {
    accessorKey: 'score',
    header: 'Score',
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
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as LeadStatus;

      const variantStyles: Record<LeadStatus, string> = {
        ENRICHED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        QUALIFIED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        ENRICHING: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        NEW: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
        REJECTED: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      };

      return (
        <Badge className={`px-2.5 py-0.5 font-medium text-xs ${variantStyles[status] || variantStyles.NEW}`}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value: string[]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell lead={row.original} />,
  },
];
