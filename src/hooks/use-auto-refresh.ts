'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom Hook de React para auto-refrescar la página/componente a un intervalo regular,
 * invalidando la caché de Server Components para traer datos frescos de PostgreSQL.
 */
export function useAutoRefresh(intervalMs: number = 5000, isActive: boolean = true) {
  const router = useRouter();

  React.useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs, isActive]);
}
