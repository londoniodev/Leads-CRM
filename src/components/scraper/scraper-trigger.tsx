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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { triggerGoogleMapsScraper, ScraperInputOptions } from '@/actions/scraper.actions';
import { toast } from 'sonner';
import { Bot, Loader2, Sparkles, MapPin, Globe2, SlidersHorizontal, Search } from 'lucide-react';

export function ScraperTrigger() {
  const [open, setOpen] = React.useState(false);
  
  // Parámetros de búsqueda
  const [searchTerms, setSearchTerms] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('CO');
  const [language, setLanguage] = React.useState('es');
  const [limit, setLimit] = React.useState(50);
  
  // Filtros avanzados
  const [skipClosedPlaces, setSkipClosedPlaces] = React.useState(true);
  const [scrapeWebsite, setScrapeWebsite] = React.useState(true);
  const [scrapeEmailsAndSocialMedia, setScrapeEmailsAndSocialMedia] = React.useState(true);

  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const termsArray = searchTerms
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (termsArray.length === 0 && !locationQuery.trim()) {
      toast.error('Por favor ingresa al menos un término de búsqueda o una ubicación.');
      return;
    }

    const payload: ScraperInputOptions = {
      searchStringsArray: termsArray.length > 0 ? termsArray : undefined,
      query: termsArray.length === 1 ? termsArray[0] : undefined,
      locationQuery: locationQuery.trim() || undefined,
      countryCode: countryCode !== 'ALL' ? countryCode : undefined,
      language,
      maxCrawledPlacesPerSearch: Number(limit) || 50,
      skipClosedPlaces,
      scrapeWebsite,
      scrapeEmailsAndSocialMedia,
    };

    startTransition(async () => {
      const res = await triggerGoogleMapsScraper(payload);

      if (res.success && res.data?.runId) {
        const displayQuery = termsArray.join(', ') || locationQuery.trim() || 'Extracción B2B';
        const newJob = {
          runId: res.data.runId,
          query: displayQuery,
          limit: Number(limit),
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer">
            <Bot className="h-4 w-4" />
            <span>Nueva Extracción</span>
          </Button>
        }
      />
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Configurar Extracción B2B de Prospectos
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Personaliza todos los parámetros de extracción para rascar Google Maps y enriquecer con Crawlee en segundo plano.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Término(s) de Búsqueda */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-emerald-400" />
              Término(s) de Búsqueda / Nichos (separados por coma)
            </Label>
            <Input
              placeholder="Ej: Odontólogos, Clínicas Dentales, Estética"
              value={searchTerms}
              onChange={(e) => setSearchTerms(e.target.value)}
              disabled={isPending}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            />
            <p className="text-[11px] text-zinc-400">
              Puedes ingresar varios nichos separados por coma para extraerlos simultáneamente.
            </p>
          </div>

          {/* Ubicación y País */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                Ubicación / Ciudad Específica
              </Label>
              <Input
                placeholder="Ej: Bogotá, Madrid, Medellín..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                disabled={isPending}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
                País de Búsqueda
              </Label>
              <Select value={countryCode} onValueChange={(val) => setCountryCode(val || 'CO')} disabled={isPending}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="CO">🇨🇴 Colombia (CO)</SelectItem>
                  <SelectItem value="ES">🇪🇸 España (ES)</SelectItem>
                  <SelectItem value="MX">🇲🇽 México (MX)</SelectItem>
                  <SelectItem value="US">🇺🇸 Estados Unidos (US)</SelectItem>
                  <SelectItem value="AR">🇦🇷 Argentina (AR)</SelectItem>
                  <SelectItem value="CL">🇨🇱 Chile (CL)</SelectItem>
                  <SelectItem value="PE">🇵🇪 Perú (PE)</SelectItem>
                  <SelectItem value="EC">🇪🇨 Ecuador (EC)</SelectItem>
                  <SelectItem value="ALL">🌐 Todos / Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Límite e Idioma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-200">Límite por Búsqueda</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={isPending}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-200">Idioma de Resultados</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val || 'es')} disabled={isPending}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="es">Español (es)</SelectItem>
                  <SelectItem value="en">Inglés (en)</SelectItem>
                  <SelectItem value="pt">Portugués (pt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros y Opciones Avanzadas */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                Opciones de Filtrado & Enriquecimiento
              </span>
            </div>

            <div className="space-y-2.5 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <Label htmlFor="skip-closed" className="text-xs text-zinc-300 cursor-pointer">
                  Omitir locales cerrados permanentemente
                </Label>
                <Switch
                  id="skip-closed"
                  checked={skipClosedPlaces}
                  onCheckedChange={setSkipClosedPlaces}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="scrape-website" className="text-xs text-zinc-300 cursor-pointer">
                  Extraer dominio y sitio web
                </Label>
                <Switch
                  id="scrape-website"
                  checked={scrapeWebsite}
                  onCheckedChange={setScrapeWebsite}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="scrape-contacts" className="text-xs text-zinc-300 cursor-pointer">
                  Extraer emails y redes sociales
                </Label>
                <Switch
                  id="scrape-contacts"
                  checked={scrapeEmailsAndSocialMedia}
                  onCheckedChange={setScrapeEmailsAndSocialMedia}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 px-5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Lanzando Scraper...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Iniciar Extracción
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
