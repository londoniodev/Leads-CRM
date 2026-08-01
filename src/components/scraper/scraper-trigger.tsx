'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ScraperDrawerShell } from './scraper-drawer-shell';
import { ScraperDrawerForm } from './scraper-drawer-form';
import { triggerGoogleMapsScraper, ScraperInputOptions } from '@/actions/scraper.actions';
import { toast } from 'sonner';
import { Bot, Sparkles } from 'lucide-react';

export function ScraperTrigger() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleFormSubmit = (options: ScraperInputOptions, displayQuery: string) => {
    startTransition(async () => {
      const res = await triggerGoogleMapsScraper(options);

      if (res.success && res.data?.runId) {
        const newJob = {
          runId: res.data.runId,
          query: displayQuery,
          limit: options.maxCrawledPlacesPerSearch || 50,
          status: res.data.status || 'RUNNING',
          startedAt: Date.now(),
        };

        window.dispatchEvent(new CustomEvent('scraper-job-added', { detail: newJob }));

        toast.success(`Scraper lanzado en Apify Cloud con éxito (Run ID: ${res.data.runId})`);
        setOpen(false);
      } else {
        toast.error(res.error || 'Ocurrió un error al iniciar la extracción.');
      }
    });
  };

  return (
    <ScraperDrawerShell
      open={open}
      onOpenChange={setOpen}
      triggerButton={
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer font-sans">
          <Bot className="h-4 w-4" />
          <span>Nueva Extracción</span>
        </Button>
      }
      title={
        <>
          <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
          Extracción B2B de Prospectos
        </>
      }
      description="Configura los filtros de búsqueda y enriquecimiento para rascado en tiempo real."
    >
      <ScraperDrawerForm
        onSubmit={handleFormSubmit}
        onCancel={() => setOpen(false)}
        isPending={isPending}
      />
    </ScraperDrawerShell>
  );
}
