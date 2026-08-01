'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Check,
  X,
  Clock,
  CheckCircle2,
  Sparkles,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { LeadStatus } from '@prisma/client';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const statusOptions = [
  { label: 'NEW', value: LeadStatus.NEW, icon: Clock, color: 'text-zinc-400' },
  { label: 'ENRICHING', value: LeadStatus.ENRICHING, icon: RefreshCw, color: 'text-amber-400' },
  { label: 'ENRICHED', value: LeadStatus.ENRICHED, icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'QUALIFIED', value: LeadStatus.QUALIFIED, icon: Sparkles, color: 'text-blue-400' },
  { label: 'REJECTED', value: LeadStatus.REJECTED, icon: XCircle, color: 'text-rose-400' },
];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Función para refrescar manualmente los Server Components sin recargar la pestaña
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  // Exportar a CSV nativo usando Blob y URL.createObjectURL
  const handleExportCSV = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    // Si hay filas seleccionadas masivamente, exportar solo esas; si no, exportar todas las filtradas
    const targetRows = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;

    if (targetRows.length === 0) return;

    const headers = ['Empresa', 'Nicho', 'Email Principal', 'Telefono E.164', 'Estado', 'Score', 'Ubicacion', 'Sitio Web'];

    const csvRows = targetRows.map((row) => {
      const original = row.original as any;
      const location = [original.city, original.country].filter(Boolean).join(', ');

      const values = [
        original.companyName || '',
        original.niche || '',
        original.primaryEmail || '',
        original.phoneE164 || '',
        original.status || '',
        original.score ?? 0,
        location,
        original.website || '',
      ];

      return values.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manejo del filtro facetado de Status
  const statusColumn = table.getColumn('status');
  const selectedStatuses = new Set((statusColumn?.getFilterValue() as string[]) || []);

  const toggleStatusFilter = (statusValue: string) => {
    const updated = new Set(selectedStatuses);
    if (updated.has(statusValue)) {
      updated.delete(statusValue);
    } else {
      updated.add(statusValue);
    }
    const filterArray = Array.from(updated);
    statusColumn?.setFilterValue(filterArray.length > 0 ? filterArray : undefined);
  };

  const clearStatusFilter = () => {
    statusColumn?.setFilterValue(undefined);
  };

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4 font-sans">
      {/* Barra de Filtros, Búsqueda y Exportación */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Buscador de Empresa */}
          <div className="relative min-w-[240px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por empresa..."
              value={(table.getColumn('companyName')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('companyName')?.setFilterValue(event.target.value)
              }
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            />
          </div>

          {/* Filtro Facetado por Estado */}
          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'h-9 border-dashed border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 cursor-pointer'
              )}
            >
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <span>Estado</span>
              {selectedStatuses.size > 0 && (
                <>
                  <div className="h-4 w-px bg-zinc-800 mx-1" />
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0 text-[10px] font-semibold">
                    {selectedStatuses.size}
                  </Badge>
                </>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 bg-zinc-900 border-zinc-800 text-zinc-200" align="start">
              <Command className="bg-zinc-900 text-zinc-200">
                <CommandInput placeholder="Filtrar estado..." className="text-zinc-200" />
                <CommandList>
                  <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                  <CommandGroup>
                    {statusOptions.map((option) => {
                      const isSelected = selectedStatuses.has(option.value);
                      const Icon = option.icon;
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => toggleStatusFilter(option.value)}
                          className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-zinc-200 py-1.5"
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-700',
                              isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'opacity-50 [&_svg]:invisible'
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </div>
                          <Icon className={cn('h-3.5 w-3.5', option.color)} />
                          <span className="text-xs font-medium">{option.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedStatuses.size > 0 && (
                    <>
                      <CommandSeparator className="bg-zinc-800" />
                      <CommandGroup>
                        <CommandItem
                          onSelect={clearStatusFilter}
                          className="justify-center text-center text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer py-1.5"
                        >
                          Limpiar filtros
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Botón de Refrescar Datos */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="h-9 bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 cursor-pointer"
            title="Refrescar datos en tiempo real de PostgreSQL"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
        </div>

        {/* Acciones de Lote y Exportar a CSV */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white gap-2 cursor-pointer h-9 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
            {selectedCount > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-1.5 text-[10px]">
                {selectedCount}
              </Badge>
            )}
          </Button>
          <div className="text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">{table.getRowModel().rows.length}</span> de{' '}
            <span className="font-semibold text-zinc-200">{data.length}</span>
          </div>
        </div>
      </div>

      {/* Tabla Interactiva */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-900/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-zinc-800 hover:bg-zinc-900">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-zinc-300 font-semibold text-xs py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-zinc-800/60 hover:bg-zinc-800/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-zinc-500 text-sm">
                  No se encontraron prospectos que coincidan con los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación e Información de Selección */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2 text-xs text-zinc-400">
        <div>
          {selectedCount > 0 ? (
            <span>
              <strong className="text-emerald-400">{selectedCount}</strong> de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </span>
          ) : (
            <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 h-8 text-xs cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 h-8 text-xs cursor-pointer"
          >
            Siguiente <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
