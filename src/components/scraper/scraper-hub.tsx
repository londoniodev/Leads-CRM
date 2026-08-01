'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getScraperRunStatus } from '@/actions/scraper.actions';
import { toast } from 'sonner';
import { Loader2, Activity, CheckCircle2, XCircle, Search, Trash2 } from 'lucide-react';

export interface ActiveScraperJob {
  runId: string;
  query: string;
  limit: number;
  status: string;
  startedAt: number;
}

const STORAGE_KEY = 'leads_crm_active_scraper_jobs';

export function ScraperHub() {
  const router = useRouter();
  const [jobs, setJobs] = React.useState<ActiveScraperJob[]>([]);
  const [open, setOpen] = React.useState(false);

  // Cargar trabajos iniciales desde localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setJobs(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error al cargar trabajos de extracción:', e);
    }
  }, []);

  // Guardar cambios en localStorage
  const updateJobs = React.useCallback((newJobs: ActiveScraperJob[]) => {
    setJobs(newJobs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newJobs));
    } catch (e) {
      console.error('Error al guardar trabajos de extracción:', e);
    }
  }, []);

  // Escuchar eventos globales de nuevos trabajos lanzados
  React.useEffect(() => {
    const handleJobAdded = (event: Event) => {
      const customEvent = event as CustomEvent<ActiveScraperJob>;
      if (customEvent.detail) {
        setJobs((prev) => {
          const updated = [customEvent.detail, ...prev.filter((j) => j.runId !== customEvent.detail.runId)];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    };

    window.addEventListener('scraper-job-added', handleJobAdded);
    return () => window.removeEventListener('scraper-job-added', handleJobAdded);
  }, []);

  // Polling dinámico de estado en la nube de Apify + Auto-refresh de la tabla
  React.useEffect(() => {
    const activeJobs = jobs.filter((j) => j.status === 'RUNNING' || j.status === 'READY' || j.status === 'BUILDING');
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanges = false;
      const updatedJobs = [...jobs];

      for (let i = 0; i < updatedJobs.length; i++) {
        const job = updatedJobs[i];
        if (job.status === 'RUNNING' || job.status === 'READY' || job.status === 'BUILDING') {
          const res = await getScraperRunStatus(job.runId);
          if (res.success && res.data) {
            const newStatus = res.data.status;
            if (newStatus !== job.status) {
              hasChanges = true;
              updatedJobs[i] = { ...job, status: newStatus };

              if (newStatus === 'SUCCEEDED') {
                toast.success(`Extracción de "${job.query}" finalizada en Apify. Actualizando datos de PostgreSQL...`, {
                  duration: 6000,
                });
                
                // Refrescar Server Components inmediatamente al terminar
                router.refresh();

                // Auto-remover trabajos completados después de 4 segundos
                setTimeout(() => {
                  setJobs((current) => {
                    const filtered = current.filter((j) => j.runId !== job.runId);
                    try {
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
                    } catch (e) {}
                    return filtered;
                  });
                  router.refresh();
                }, 4000);
              } else if (newStatus === 'FAILED' || newStatus === 'ABORTED' || newStatus === 'TIMED-OUT') {
                toast.error(`La extracción de "${job.query}" falló o fue cancelada en Apify. (${newStatus})`);
              }
            }
          }
        }
      }

      if (hasChanges) {
        updateJobs(updatedJobs);
      } else {
        // Refrescar periódicamente la tabla para mostrar leads procesados gradualmente por el Worker
        router.refresh();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [jobs, updateJobs, router]);

  const removeJob = (runId: string) => {
    const filtered = jobs.filter((j) => j.runId !== runId);
    updateJobs(filtered);
    router.refresh();
  };

  const activeCount = jobs.filter((j) => j.status === 'RUNNING' || j.status === 'READY' || j.status === 'BUILDING').length;

  if (jobs.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 gap-2 h-9 px-3 font-sans cursor-pointer"
          >
            <Activity className={`h-4 w-4 ${activeCount > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span>Extracciones Hub</span>
            <Badge
              className={`px-1.5 py-0 text-[10px] font-bold ${
                activeCount > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {activeCount > 0 ? `${activeCount} en curso` : `${jobs.length} total`}
            </Badge>
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl font-sans" align="end">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h4 className="font-semibold text-sm text-white">Hub de Extracciones en Curso</h4>
          </div>
          {activeCount > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
              Auto-actualizando
            </Badge>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60 p-1">
          {jobs.map((job) => {
            const isRunning = job.status === 'RUNNING' || job.status === 'READY' || job.status === 'BUILDING';
            const isSuccess = job.status === 'SUCCEEDED';
            const isFailed = job.status === 'FAILED' || job.status === 'ABORTED' || job.status === 'TIMED-OUT';

            return (
              <div key={job.runId} className="p-3 space-y-1.5 hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="font-medium text-sm text-zinc-100 truncate">{job.query}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeJob(job.runId)}
                    className="text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 shrink-0"
                    title="Descartar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    {isRunning && (
                      <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 gap-1 px-1.5 py-0 text-[10px]">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Scrapeando ({job.status})
                      </Badge>
                    )}
                    {isSuccess && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1 px-1.5 py-0 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />
                        Finalizado
                      </Badge>
                    )}
                    {isFailed && (
                      <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 gap-1 px-1.5 py-0 text-[10px]">
                        <XCircle className="h-3 w-3" />
                        Error ({job.status})
                      </Badge>
                    )}
                  </div>

                  <span className="text-zinc-500 text-[11px] font-mono">Límite: {job.limit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
