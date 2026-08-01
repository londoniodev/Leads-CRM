'use client';

import * as React from 'react';
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

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
    <div className="space-y-4">
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
                'h-9 border-dashed border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2'
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
                            className={`flex h-4 w-4 items-center justify-center rounded border border-zinc-700 ${
                              isSelected ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'opacity-50'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <Icon className={`h-3.5 w-3.5 ${option.color}`} />
                          <span className="text-sm font-medium">{option.label}</span>
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
                          className="justify-center text-center text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer py-2"
                        >
                          Limpiar filtros ({selectedStatuses.size})
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Reset rápido si hay filtro activo */}
          {selectedStatuses.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearStatusFilter}
              className="h-9 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 px-2.5 gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Acciones del lado derecho: Selección + Exportar a CSV */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          {selectedCount > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-semibold text-xs animate-in fade-in-50">
              {selectedCount} {selectedCount === 1 ? 'filas seleccionada' : 'filas seleccionadas'}
            </Badge>
          )}

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-9 bg-zinc-950 border-zinc-800 hover:bg-zinc-800 text-zinc-200 gap-2 font-medium"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Exportar CSV</span>
            {selectedCount > 0 && (
              <span className="text-xs text-emerald-400 font-bold">({selectedCount})</span>
            )}
          </Button>

          <div className="text-xs text-zinc-400 hidden sm:block border-l border-zinc-800 pl-3">
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
                    <TableHead key={header.id} className="text-zinc-300 font-semibold">
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
                  className="border-zinc-800/60 hover:bg-zinc-800/40 data-[state=selected]:bg-emerald-500/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-zinc-500">
                  No se encontraron resultados con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2 py-2">
        <div className="text-xs text-zinc-500">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
          >
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
