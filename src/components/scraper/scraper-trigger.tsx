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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { triggerGoogleMapsScraper } from '@/actions/scraper.actions';
import { toast } from 'sonner';
import { Bot, Loader2, Sparkles } from 'lucide-react';

export function ScraperTrigger() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [limit, setLimit] = React.useState(50);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
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
            Lanzar Scraper B2B de Apify
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Ingresa el sector, nicho o palabra clave para extraer prospectos de Google Maps mediante colas asíncronas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
      </DialogContent>
    </Dialog>
  );
}
