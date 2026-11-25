/**
 * Quick links file format, shared by the app (which reads it) and the
 * Cloudflare Pages Function in functions/api/quick-links.ts (which validates and stores it).
 *
 *   {
 *     "defaults": { "linkSwitchDurationSec": 15, "embedFadeOutMin": 10 },
 *     "presets": [
 *       { "name": "Results", "links": ["https://example.com/results"] },
 *       { "name": "Final", "links": ["https://a.com", "https://b.com"], "darkMode": false }
 *     ]
 *   }
 *
 * Every setting is optional, both in `defaults` and in a preset. A preset's own
 * value wins over `defaults`; a setting set in neither leaves the current value
 * unchanged when the preset's button is clicked.
 */

export interface QuickLinkSettings {
  links?: string[];
  linkSwitchDurationSec?: number;
  embedFadeOutMin?: number;
  darkMode?: boolean;
  fontSize?: number;
  embedOverflow?: boolean;
  wakeLockEnabled?: boolean;
}

export interface QuickLinkPresetConfig extends QuickLinkSettings {
  name: string;
}

export interface QuickLinksConfig {
  defaults: QuickLinkSettings;
  presets: QuickLinkPresetConfig[];
}

/** A preset ready for use: its own settings merged over `defaults`. */
export interface QuickLinkPreset {
  name: string;
  settings: QuickLinkSettings;
}

export type QuickLinkAppSettings = Pick<
  QuickLinkSettings,
  'darkMode' | 'fontSize' | 'embedOverflow' | 'wakeLockEnabled'
>;

export const QUICK_LINKS_LIMITS = {
  maxPresets: 50,
  maxLinksPerPreset: 20,
  maxNameLength: 100,
  maxUrlLength: 2000,
};

const NUMBER_SETTINGS = [
  ['linkSwitchDurationSec', 1],
  ['embedFadeOutMin', 0],
  ['fontSize', 1],
] as const;

const BOOLEAN_SETTINGS = ['darkMode', 'embedOverflow', 'wakeLockEnabled'] as const;

const SETTING_KEYS: string[] = [
  'links',
  ...NUMBER_SETTINGS.map(([key]) => key),
  ...BOOLEAN_SETTINGS,
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const parseLinks = (value: unknown, where: string, errors: string[]): string[] | undefined => {
  if (!Array.isArray(value)) {
    errors.push(`${where}: "links" must be a list of URLs.`);
    return undefined;
  }

  const links: string[] = [];
  value.forEach((item, index) => {
    const link = typeof item === 'string' ? item.trim() : '';
    if (!isHttpsUrl(link) || link.length > QUICK_LINKS_LIMITS.maxUrlLength) {
      errors.push(`${where}: link #${index + 1} must be a full https:// URL.`);
      return;
    }
    links.push(link);
  });

  if (links.length > QUICK_LINKS_LIMITS.maxLinksPerPreset) {
    errors.push(`${where}: at most ${QUICK_LINKS_LIMITS.maxLinksPerPreset} links are allowed.`);
    return links.slice(0, QUICK_LINKS_LIMITS.maxLinksPerPreset);
  }
  if (value.length === 0) {
    errors.push(`${where}: "links" must contain at least one URL.`);
  }
  return links.length > 0 ? links : undefined;
};

/** Reads the settings of `defaults` or of one preset, collecting an error for each invalid or unknown field. */
const parseSettings = (
  raw: Record<string, unknown>,
  where: string,
  errors: string[],
  extraKeys: string[] = [],
): QuickLinkSettings => {
  const settings: QuickLinkSettings = {};

  for (const key of Object.keys(raw)) {
    if (!SETTING_KEYS.includes(key) && !extraKeys.includes(key)) {
      errors.push(`${where}: unknown field "${key}".`);
    }
  }

  if (raw.links !== undefined) {
    const links = parseLinks(raw.links, where, errors);
    if (links) settings.links = links;
  }

  for (const [key, min] of NUMBER_SETTINGS) {
    const value = raw[key];
    if (value === undefined) continue;
    if (typeof value === 'number' && Number.isFinite(value) && value >= min) {
      settings[key] = value;
    } else {
      errors.push(`${where}: "${key}" must be a number, at least ${min}.`);
    }
  }

  for (const key of BOOLEAN_SETTINGS) {
    const value = raw[key];
    if (value === undefined) continue;
    if (typeof value === 'boolean') {
      settings[key] = value;
    } else {
      errors.push(`${where}: "${key}" must be true or false.`);
    }
  }

  return settings;
};

/**
 * Validates a quick links file. Returns the valid parts as `config` (invalid
 * fields and presets left out) and a message for every problem in `errors`.
 * The app uses `config` even when there are errors; the API refuses to save
 * a file with errors.
 */
export const normalizeQuickLinksConfig = (data: unknown): { config: QuickLinksConfig; errors: string[] } => {
  const errors: string[] = [];
  const config: QuickLinksConfig = { defaults: {}, presets: [] };

  if (!isRecord(data)) {
    errors.push('The file must be a JSON object with a "presets" list.');
    return { config, errors };
  }

  for (const key of Object.keys(data)) {
    if (key !== 'defaults' && key !== 'presets') errors.push(`Unknown top-level field "${key}".`);
  }

  if (data.defaults !== undefined) {
    if (isRecord(data.defaults)) config.defaults = parseSettings(data.defaults, 'defaults', errors);
    else errors.push('"defaults" must be an object.');
  }

  if (!Array.isArray(data.presets)) {
    errors.push('"presets" must be a list.');
    return { config, errors };
  }

  if (data.presets.length > QUICK_LINKS_LIMITS.maxPresets) {
    errors.push(`At most ${QUICK_LINKS_LIMITS.maxPresets} presets are allowed.`);
  }

  const seenNames = new Set<string>();
  data.presets.slice(0, QUICK_LINKS_LIMITS.maxPresets).forEach((raw: unknown, index: number) => {
    const where = `preset #${index + 1}`;
    if (!isRecord(raw)) {
      errors.push(`${where} must be an object.`);
      return;
    }
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (name === '' || name.length > QUICK_LINKS_LIMITS.maxNameLength) {
      errors.push(`${where}: "name" is required, at most ${QUICK_LINKS_LIMITS.maxNameLength} characters.`);
      return;
    }
    if (seenNames.has(name)) {
      errors.push(`${where}: the name "${name}" is already used by another preset.`);
      return;
    }
    seenNames.add(name);
    config.presets.push({ name, ...parseSettings(raw, `preset "${name}"`, errors, ['name']) });
  });

  return { config, errors };
};

export const resolveQuickLinkPresets = (config: QuickLinksConfig): QuickLinkPreset[] =>
  config.presets.map(({ name, ...own }) => ({ name, settings: { ...config.defaults, ...own } }));

/** The part of a preset that goes to the app settings rather than the setup form. */
export const getAppSettingsOverrides = (settings: QuickLinkSettings): QuickLinkAppSettings => {
  const overrides: QuickLinkAppSettings = {};
  if (settings.darkMode !== undefined) overrides.darkMode = settings.darkMode;
  if (settings.fontSize !== undefined) overrides.fontSize = settings.fontSize;
  if (settings.embedOverflow !== undefined) overrides.embedOverflow = settings.embedOverflow;
  if (settings.wakeLockEnabled !== undefined) overrides.wakeLockEnabled = settings.wakeLockEnabled;
  return overrides;
};
