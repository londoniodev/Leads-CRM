import { getLeads } from '@/actions/lead.actions';
import { columns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Database } from 'lucide-react';
import { ScraperTrigger } from '@/components/scraper/scraper-trigger';
import { ScraperHub } from '@/components/scraper/scraper-hub';

export const revalidate = 0; // Lectura dinámica en tiempo real sin caché estática

export default async function HomePage() {
  const result = await getLeads();
  const leads = result.data || [];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Superior del CRM */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Panel CRM - Lead Generator</h1>
            </div>
            <p className="text-zinc-400 text-sm">
              Gestión interactiva de prospectos B2B extraídos de Google Maps, Instagram y TikTok.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ScraperHub />
            <Badge variant="outline" className="text-zinc-300 border-zinc-800 bg-zinc-900 px-3 py-1.5 flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              Dokploy PostgreSQL: <span className="font-semibold text-emerald-400">{leads.length} Leads</span>
            </Badge>
            <ScraperTrigger />
          </div>
        </div>

        {/* Tabla Interctiva de TanStack Table */}
        <DataTable columns={columns} data={leads} />
      </div>
    </main>
  );
}
