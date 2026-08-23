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
import { Bot, Loader2, MapPin, Globe2, SlidersHorizontal, Search, Star, Share2, Layers } from 'lucide-react';

export interface ScraperDrawerFormProps {
  onSubmit: (options: ScraperInputOptions, displayQuery: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

/**
 * Formulario abstraído para la configuración de búsqueda B2B agnóstica de fuente (Cumple SRP e ISP).
 */
export function ScraperDrawerForm({
  onSubmit,
  onCancel,
  isPending,
}: ScraperDrawerFormProps) {
  const [source, setSource] = React.useState<'GOOGLE_MAPS' | 'INSTAGRAM' | 'TIKTOK'>('GOOGLE_MAPS');
  const [searchTerms, setSearchTerms] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('CO');
  const language = 'es';
  const [limit, setLimit] = React.useState(50);
  const [minRating, setMinRating] = React.useState('0');
  
  const [skipClosedPlaces, setSkipClosedPlaces] = React.useState(true);
  const scrapeWebsite = true;
  const [onlyWithWebsite, setOnlyWithWebsite] = React.useState(false);
  const scrapeEmailsAndSocialMedia = true;
  const [enrichSocial, setEnrichSocial] = React.useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const termsArray = searchTerms
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const displayQuery = termsArray.join(', ') || locationQuery.trim() || `Extracción ${source}`;

    const payload: ScraperInputOptions = {
      source,
      searchStringsArray: termsArray.length > 0 ? termsArray : undefined,
      query: termsArray.length === 1 ? termsArray[0] : undefined,
      locationQuery: locationQuery.trim() || undefined,
      countryCode: countryCode !== 'ALL' ? countryCode : undefined,
      language,
      maxCrawledPlacesPerSearch: Number(limit) || 50,
      skipClosedPlaces: source === 'GOOGLE_MAPS' ? skipClosedPlaces : undefined,
      scrapeWebsite: source === 'GOOGLE_MAPS' ? scrapeWebsite : undefined,
      onlyWithWebsite: source === 'GOOGLE_MAPS' ? onlyWithWebsite : undefined,
      scrapeEmailsAndSocialMedia: source === 'GOOGLE_MAPS' ? scrapeEmailsAndSocialMedia : undefined,
      minRating: source === 'GOOGLE_MAPS' && Number(minRating) > 0 ? Number(minRating) : undefined,
      enrichSocial: source === 'GOOGLE_MAPS' ? enrichSocial : undefined,
    };

    onSubmit(payload, displayQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-zinc-100">
      {/* Selector de Fuente de Extracción (Entidad Agnóstica) */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          Fuente de Extracción
        </Label>
        <Select value={source} onValueChange={(val) => { if (val) setSource(val as 'GOOGLE_MAPS' | 'INSTAGRAM' | 'TIKTOK'); }} disabled={isPending}>
          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100 font-medium">
            <SelectValue placeholder="Seleccionar fuente" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
            <SelectItem value="GOOGLE_MAPS">📍 Google Maps (Empresas & Negocios Locales)</SelectItem>
            <SelectItem value="INSTAGRAM">📸 Instagram (Perfiles & Marcas Comerciales)</SelectItem>
            <SelectItem value="TIKTOK">🎵 TikTok (Creadores & Cuentas de Marcas)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Términos de Búsqueda */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-blue-400" />
          Término(s) de Búsqueda / Keywords
        </Label>
        <Input
          placeholder={source === 'GOOGLE_MAPS' ? "Ej: Odontólogos, Clínicas Dentales, Estética" : "Ej: @restaurantes_bogota, hamburguesas, cali"}
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
          disabled={isPending}
          className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
        />
        <p className="text-[11px] text-zinc-400">
          {source === 'GOOGLE_MAPS' ? "Puedes separar múltiples nichos por comas." : "Ingresa handles o palabras clave de búsqueda."}
        </p>
      </div>

      {/* Ubicación y País */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
            Ubicación / Ciudad (Opcional)
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
            <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
            País de Búsqueda
          </Label>
          <Select value={countryCode} onValueChange={(val) => { if (val) setCountryCode(val); }} disabled={isPending}>
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

      {/* Límite y (si es Google Maps) Calificación Mínima */}
      <div className={`grid ${source === 'GOOGLE_MAPS' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-200">Límite de Resultados</Label>
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

        {source === 'GOOGLE_MAPS' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              Min Rating
            </Label>
            <Select value={minRating} onValueChange={(val) => { if (val) setMinRating(val); }} disabled={isPending}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="0">Todas (0+ ⭐)</SelectItem>
                <SelectItem value="3.0">3.0+ ⭐</SelectItem>
                <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                <SelectItem value="4.5">4.5+ ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Filtros Avanzados (Solo visibles para GOOGLE_MAPS) */}
      {source === 'GOOGLE_MAPS' && (
        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            Filtros & Enriquecimiento de Google Maps
          </span>

          <div className="space-y-3 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/90">
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
              <Label htmlFor="only-website-drawer" className="text-xs text-zinc-300 cursor-pointer flex items-center gap-1">
                Solo con sitio web
              </Label>
              <Switch
                id="only-website-drawer"
                checked={onlyWithWebsite}
                onCheckedChange={setOnlyWithWebsite}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enrich-social-drawer" className="text-xs text-zinc-300 cursor-pointer flex items-center gap-1.5">
                <Share2 className="h-3 w-3 text-purple-400" />
                Enriquecer Redes (Instagram/TikTok)
              </Label>
              <Switch
                id="enrich-social-drawer"
                checked={enrichSocial}
                onCheckedChange={setEnrichSocial}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      )}

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
              Iniciar Extracción ({source})
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
