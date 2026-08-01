'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { triggerGoogleMapsScraper, ingestManualDataset } from '@/actions/scraper.actions';
import { toast } from 'sonner';
import { Bot, Loader2, Sparkles, Database, Download } from 'lucide-react';

export function ScraperTrigger() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [limit, setLimit] = React.useState(50);
  const [manualDatasetId, setManualDatasetId] = React.useState('');
  const [isPending, startTransition] = React.useTransition();
  const [isIngesting, startIngestTransition] = React.useTransition();

  const handleScraperSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Por favor ingresa un término de búsqueda.');
      return;
    }

    startTransition(async () => {
      const res = await triggerGoogleMapsScraper(query, Number(limit));

      if (res.success && res.data?.runId) {
        const newJob = {
          runId: res.data.runId,
          query: query.trim(),
          limit: Number(limit),
          status: res.data.status || 'RUNNING',
          startedAt: Date.now(),
        };

        window.dispatchEvent(new CustomEvent('scraper-job-added', { detail: newJob }));

        toast.success(`Scraper iniciado con éxito en la nube de Apify (Run ID: ${res.data.runId})`);
        setOpen(false);
        setQuery('');
      } else {
        toast.error(res.error || 'Ocurrió un error al iniciar la extracción.');
      }
    });
  };

  const handleManualIngestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualDatasetId.trim()) {
      toast.error('Por favor ingresa el Dataset ID de Apify.');
      return;
    }

    startIngestTransition(async () => {
      const res = await ingestManualDataset(manualDatasetId.trim());

      if (res.success) {
        toast.success(res.message || 'Ingesta manual del dataset iniciada correctamente.');
        setOpen(false);
        setManualDatasetId('');
      } else {
        toast.error(res.message || 'Error al iniciar la ingesta del dataset.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer">
            <Bot className="h-4 w-4" />
            <span>Nueva Extracción</span>
          </Button>
        }
      />
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Extracción & Ingesta B2B
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Lanza un scraper en la nube de Apify o ingresa manualmente un dataset existente.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="extraction" className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-950 border border-zinc-800">
            <TabsTrigger value="extraction" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 gap-1.5 text-xs">
              <Bot className="h-3.5 w-3.5" /> Nueva Extracción
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 text-zinc-400 gap-1.5 text-xs">
              <Database className="h-3.5 w-3.5" /> Ingesta Manual
            </TabsTrigger>
          </TabsList>

          {/* Pestaña 1: Nueva Extracción */}
          <TabsContent value="extraction">
            <form onSubmit={handleScraperSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Término de Búsqueda / Nicho</label>
                <Input
                  placeholder="Ej: Odontólogos en Madrid, Restaurantes en Bogotá..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isPending}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Límite Máximo de Prospectos</label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  disabled={isPending}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Lanzando...
                    </>
                  ) : (
                    'Iniciar Extracción'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Pestaña 2: Ingesta Manual */}
          <TabsContent value="manual">
            <form onSubmit={handleManualIngestSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Dataset ID de Apify</label>
                <Input
                  placeholder="Ej: Rvbs1y1CtalhkhB8s, CWHn5JCFwXYDaTbjA..."
                  value={manualDatasetId}
                  onChange={(e) => setManualDatasetId(e.target.value)}
                  disabled={isIngesting}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-zinc-400">
                  Copia el ID del Dataset desde tu consola de Apify para procesar e inyectar los prospectos a PostgreSQL en segundo plano.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isIngesting}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isIngesting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2"
                >
                  {isIngesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Ingresar Dataset
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
