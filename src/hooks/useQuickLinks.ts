import { useState, useEffect } from 'react';
import {
  normalizeQuickLinksConfig,
  QuickLinkPreset,
  resolveQuickLinkPresets,
} from '../quickLinksConfig';

/** Served by functions/api/quick-links.ts on the same Cloudflare Pages site. */
const QUICK_LINKS_URL = '/api/quick-links';

export const useQuickLinks = () => {
  const [presets, setPresets] = useState<QuickLinkPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(QUICK_LINKS_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const { config, errors } = normalizeQuickLinksConfig(await response.json());
      errors.forEach(message => console.warn(`Quick links: ${message}`));
      setPresets(resolveQuickLinkPresets(config));
    } catch (err) {
      console.error('Failed to load quick links:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quick links');
      setPresets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  return {
    presets,
    isLoading,
    error,
    refetch: fetchPresets
  };
};
