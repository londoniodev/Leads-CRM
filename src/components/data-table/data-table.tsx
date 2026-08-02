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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  ButtonGroup,
  ButtonGroupText,
} from '@/components/ui/button-group';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Check,
  Clock,
  CheckCircle2,
  Sparkles,
  XCircle,
  RefreshCw,
  Trash2,
  Layers,
  ChevronDown,
  Plus,
  X,
  Tag,
  MapPin,
} from 'lucide-react';
import { LeadStatus } from '@prisma/client';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { updateLeadsStatusBulk, deleteLeadsBulk } from '@/actions/lead.actions';

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

const availableFilterOptions = [
  { id: 'status', label: 'Estado', icon: Filter },
  { id: 'niche', label: 'Nicho', icon: Tag },
  { id: 'city', label: 'Ubicación', icon: MapPin },
  { id: 'score', label: 'Score Mínimo', icon: Sparkles },
];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isPendingBulk, startBulkTransition] = React.useTransition();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Lista de filtros dinámicos activos (Estilo Notion)
  const [activeFilters, setActiveFilters] = React.useState<string[]>(['status']);

  // Hook de Polling Inteligente (Auto-Refresh SIEMPRE ACTIVO por defecto cada 5 segundos)
  useAutoRefresh(5000, true);

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

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedLeadIds = selectedRows.map((r) => (r.original as any).id).filter(Boolean);

  const handleBulkStatusChange = (newStatus: LeadStatus) => {
    if (selectedLeadIds.length === 0) return;

    startBulkTransition(async () => {
      await updateLeadsStatusBulk(selectedLeadIds, newStatus);
      table.resetRowSelection();
    });
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;

    if (confirm(`¿Estás seguro de eliminar ${selectedLeadIds.length} lead(s) seleccionados?`)) {
      startBulkTransition(async () => {
        await deleteLeadsBulk(selectedLeadIds);
        table.resetRowSelection();
      });
    }
  };

  const handleExportCSV = () => {
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

  const removeFilter = (filterId: string) => {
    table.getColumn(filterId)?.setFilterValue(undefined);
    setActiveFilters((prev) => prev.filter((id) => id !== filterId));
  };

  const clearAllFilters = () => {
    table.resetColumnFilters();
  };

  const hasAnyFilterActive = activeFilters.length > 0 || columnFilters.length > 0;

  return (
    <div className="space-y-4 font-sans">
      {/* Toolbar Compacta Pixel-Perfect Estilo Notion */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
        
        {/* Lado Izquierdo: Buscador + Filtros Dinámicos (Notion-Style) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador de Empresa */}
          <div className="relative min-w-[200px] h-8">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <Input
              placeholder="Buscar por empresa..."
              value={(table.getColumn('companyName')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('companyName')?.setFilterValue(event.target.value)
              }
              className="h-8 pl-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-emerald-500/30 rounded-md"
            />
          </div>

          {/* Botón "+ Añadir Filtro" (Notion Style) */}
          <Popover>
            <PopoverTrigger className="h-8 px-2.5 border border-dashed border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer outline-none">
              <Plus className="size-3.5 text-emerald-400" />
              <span>Añadir Filtro</span>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1.5 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-2xl" align="start">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Filtros Disponibles
              </div>
              <div className="space-y-0.5 mt-1">
                {availableFilterOptions.map((opt) => {
                  const isActive = activeFilters.includes(opt.id);
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      disabled={isActive}
                      onClick={() => {
                        if (!isActive) {
                          setActiveFilters((prev) => [...prev, opt.id]);
                        }
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer',
                        isActive
                          ? 'opacity-40 cursor-not-allowed text-zinc-500'
                          : 'hover:bg-zinc-800 text-zinc-200'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="size-3.5 text-emerald-400" />
                        {opt.label}
                      </span>
                      {isActive && <Badge variant="outline" className="text-[9px] py-0 px-1 border-zinc-700 text-zinc-400">Activo</Badge>}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtros Activos con ButtonGroup Pixel-Perfect */}
          {activeFilters.map((filterId) => {
            if (filterId === 'status') {
              return (
                <ButtonGroup key="status" className="h-8 shadow-xs border border-zinc-800 rounded-md overflow-hidden bg-zinc-950/80">
                  <ButtonGroupText className="bg-zinc-900/90 text-zinc-300 text-[11px] font-medium px-2.5 flex items-center gap-1.5 border-r border-zinc-800">
                    <Filter className="size-3 text-emerald-400" />
                    <span>Estado</span>
                  </ButtonGroupText>
                  <Popover>
                    <PopoverTrigger className="h-full bg-zinc-950 text-zinc-200 text-xs px-2.5 flex items-center gap-1.5 hover:bg-zinc-900 cursor-pointer outline-none border-0">
                      <span>{selectedStatuses.size > 0 ? `${selectedStatuses.size} sel.` : 'Todos'}</span>
                      <ChevronDown className="size-3 opacity-60" />
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-0 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-2xl" align="start">
                      <Command className="bg-zinc-900 text-zinc-200">
                        <CommandInput placeholder="Filtrar estado..." className="text-zinc-200 text-xs" />
                        <CommandList>
                          <CommandEmpty>No hay opciones.</CommandEmpty>
                          <CommandGroup>
                            {statusOptions.map((option) => {
                              const isSelected = selectedStatuses.has(option.value);
                              const Icon = option.icon;
                              return (
                                <CommandItem
                                  key={option.value}
                                  onSelect={() => toggleStatusFilter(option.value)}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 text-zinc-200 py-1.5 text-xs"
                                >
                                  <div
                                    className={cn(
                                      'flex size-3.5 items-center justify-center rounded-sm border border-zinc-700',
                                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'opacity-50 [&_svg]:invisible'
                                    )}
                                  >
                                    <Check className="size-3" />
                                  </div>
                                  <Icon className={cn('size-3.5', option.color)} />
                                  <span className="font-medium">{option.label}</span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter('status')}
                    className="h-full w-7 rounded-none border-l border-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 cursor-pointer"
                    title="Quitar filtro de Estado"
                  >
                    <X className="size-3" />
                  </Button>
                </ButtonGroup>
              );
            }

            if (filterId === 'niche') {
              return (
                <ButtonGroup key="niche" className="h-8 shadow-xs border border-zinc-800 rounded-md overflow-hidden bg-zinc-950/80">
                  <ButtonGroupText className="bg-zinc-900/90 text-zinc-300 text-[11px] font-medium px-2.5 flex items-center gap-1.5 border-r border-zinc-800">
                    <Tag className="size-3 text-purple-400" />
                    <span>Nicho</span>
                  </ButtonGroupText>
                  <input
                    type="text"
                    placeholder="ej. Odontología..."
                    value={(table.getColumn('niche')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('niche')?.setFilterValue(e.target.value)}
                    className="h-full bg-zinc-950 text-zinc-100 text-xs px-2.5 w-32 focus:outline-none placeholder:text-zinc-600 font-sans border-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter('niche')}
                    className="h-full w-7 rounded-none border-l border-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 cursor-pointer"
                    title="Quitar filtro de Nicho"
                  >
                    <X className="size-3" />
                  </Button>
                </ButtonGroup>
              );
            }

            if (filterId === 'city') {
              return (
                <ButtonGroup key="city" className="h-8 shadow-xs border border-zinc-800 rounded-md overflow-hidden bg-zinc-950/80">
                  <ButtonGroupText className="bg-zinc-900/90 text-zinc-300 text-[11px] font-medium px-2.5 flex items-center gap-1.5 border-r border-zinc-800">
                    <MapPin className="size-3 text-amber-400" />
                    <span>Ubicación</span>
                  </ButtonGroupText>
                  <input
                    type="text"
                    placeholder="ej. Cali..."
                    value={(table.getColumn('city')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('city')?.setFilterValue(e.target.value)}
                    className="h-full bg-zinc-950 text-zinc-100 text-xs px-2.5 w-28 focus:outline-none placeholder:text-zinc-600 font-sans border-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter('city')}
                    className="h-full w-7 rounded-none border-l border-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 cursor-pointer"
                    title="Quitar filtro de Ubicación"
                  >
                    <X className="size-3" />
                  </Button>
                </ButtonGroup>
              );
            }

            if (filterId === 'score') {
              return (
                <ButtonGroup key="score" className="h-8 shadow-xs border border-zinc-800 rounded-md overflow-hidden bg-zinc-950/80">
                  <ButtonGroupText className="bg-zinc-900/90 text-zinc-300 text-[11px] font-medium px-2.5 flex items-center gap-1.5 border-r border-zinc-800">
                    <Sparkles className="size-3 text-blue-400" />
                    <span>Score Mín.</span>
                  </ButtonGroupText>
                  <select
                    value={(table.getColumn('score')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('score')?.setFilterValue(e.target.value || undefined)}
                    className="h-full bg-zinc-950 text-zinc-200 text-xs px-2 focus:outline-none cursor-pointer font-sans border-0"
                  >
                    <option value="">Todos</option>
                    <option value="25">≥ 25 ptos</option>
                    <option value="50">≥ 50 ptos</option>
                    <option value="70">≥ 70 ptos</option>
                    <option value="90">≥ 90 ptos</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter('score')}
                    className="h-full w-7 rounded-none border-l border-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 cursor-pointer"
                    title="Quitar filtro de Score"
                  >
                    <X className="size-3" />
                  </Button>
                </ButtonGroup>
              );
            }

            return null;
          })}

          {/* Limpiar Todo */}
          {hasAnyFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1 px-2 cursor-pointer"
            >
              <X className="size-3" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>

        {/* Lado Derecho: Acciones secundarias en una sola línea elegante */}
        <div className="flex items-center gap-2">
          {/* Indicador sutil de Actualización en Vivo (Siempre Activa) */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2.5 h-8 rounded-md border border-zinc-800/80 text-[11px] text-zinc-400" title="Auto-Refresh en tiempo real activo cada 5s">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>En Vivo</span>
          </div>

          {/* Botón Refrescar */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-1.5 text-xs px-2.5 cursor-pointer"
            title="Refrescar datos en tiempo real de PostgreSQL"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>

          {/* Exportar CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-1.5 text-xs px-2.5 cursor-pointer"
          >
            <Download className="size-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {/* Acciones en Lote */}
          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isPendingBulk}
                className="h-8 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 rounded-md transition-colors cursor-pointer shadow-md shadow-emerald-500/10 outline-none animate-in fade-in zoom-in-95 duration-150"
              >
                <Layers className="size-3.5" />
                <span>Acciones en Lote ({selectedCount})</span>
                <ChevronDown className="size-3 opacity-80" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 w-52 font-sans text-xs">
                <DropdownMenuLabel className="text-zinc-400 text-[11px] font-semibold">Cambiar Estado</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange(LeadStatus.ENRICHED)}
                  className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-emerald-400"
                >
                  <CheckCircle2 className="size-3.5" /> Marcar ENRICHED
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange(LeadStatus.QUALIFIED)}
                  className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-blue-400"
                >
                  <Sparkles className="size-3.5" /> Marcar QUALIFIED
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange(LeadStatus.NEW)}
                  className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-zinc-300"
                >
                  <Clock className="size-3.5 text-zinc-400" /> Marcar NEW
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusChange(LeadStatus.REJECTED)}
                  className="hover:bg-zinc-800 cursor-pointer flex items-center gap-2 text-rose-400"
                >
                  <XCircle className="size-3.5" /> Marcar REJECTED
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={handleBulkDelete}
                  className="hover:bg-rose-950/50 text-rose-400 cursor-pointer flex items-center gap-2 font-medium"
                >
                  <Trash2 className="size-3.5 text-rose-400" /> Eliminar seleccionados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-950/90 border-b border-zinc-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-zinc-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-zinc-400 font-semibold text-xs py-3">
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
                  className="border-zinc-800/60 hover:bg-zinc-800/40 transition-colors data-[state=selected]:bg-zinc-800/80"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-xs text-zinc-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  No se encontraron resultados de leads.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount() || 1}
          </span>
          <span className="text-zinc-600">|</span>
          <span>
            {table.getFilteredRowModel().rows.length} lead(s) en total
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft className="size-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 cursor-pointer disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
