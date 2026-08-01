'use client';

import * as React from 'react';
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
import { ScraperInputOptions } from '@/actions/scraper.actions';
import { Bot, Loader2, MapPin, Globe2, SlidersHorizontal, Search } from 'lucide-react';

export interface ScraperDrawerFormProps {
  onSubmit: (options: ScraperInputOptions, displayQuery: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

/**
 * Formulario abstraído para la configuración de búsqueda B2B (Cumple SRP e ISP).
 */
export function ScraperDrawerForm({
  onSubmit,
  onCancel,
  isPending,
}: ScraperDrawerFormProps) {
  const [searchTerms, setSearchTerms] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('CO');
  const [language, setLanguage] = React.useState('es');
  const [limit, setLimit] = React.useState(50);
  
  const [skipClosedPlaces, setSkipClosedPlaces] = React.useState(true);
  const [scrapeWebsite, setScrapeWebsite] = React.useState(true);
  const [scrapeEmailsAndSocialMedia, setScrapeEmailsAndSocialMedia] = React.useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const termsArray = searchTerms
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const displayQuery = termsArray.join(', ') || locationQuery.trim() || 'Extracción B2B';

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

    onSubmit(payload, displayQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      {/* Términos de Búsqueda */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-emerald-400" />
          Término(s) de Búsqueda / Nichos
        </Label>
        <Input
          placeholder="Ej: Odontólogos, Clínicas Dentales, Estética"
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
          disabled={isPending}
          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
        />
        <p className="text-[11px] text-zinc-400">
          Puedes separar múltiples nichos por comas.
        </p>
      </div>

      {/* Ubicación y País */}
      <div className="space-y-3">
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-200">Límite</Label>
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
          <Label className="text-xs font-semibold text-zinc-200">Idioma</Label>
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

      {/* Filtros Avanzados */}
      <div className="space-y-3 pt-3 border-t border-zinc-800/80">
        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
          Filtros de Extracción
        </span>

        <div className="space-y-3 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <Label htmlFor="skip-closed-drawer" className="text-xs text-zinc-300 cursor-pointer">
              Omitir cerrados
            </Label>
            <Switch
              id="skip-closed-drawer"
              checked={skipClosedPlaces}
              onCheckedChange={setSkipClosedPlaces}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="scrape-website-drawer" className="text-xs text-zinc-300 cursor-pointer">
              Extraer sitio web
            </Label>
            <Switch
              id="scrape-website-drawer"
              checked={scrapeWebsite}
              onCheckedChange={setScrapeWebsite}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="scrape-contacts-drawer" className="text-xs text-zinc-300 cursor-pointer">
              Extraer emails/redes
            </Label>
            <Switch
              id="scrape-contacts-drawer"
              checked={scrapeEmailsAndSocialMedia}
              onCheckedChange={setScrapeEmailsAndSocialMedia}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 text-xs px-4"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Lanzando...
            </>
          ) : (
            <>
              <Bot className="h-3.5 w-3.5" />
              Iniciar Extracción
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
