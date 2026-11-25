/**
 * Cloudflare Pages Function serving the quick links file at /api/quick-links.
 *
 *   GET  /api/quick-links          public: the current file
 *   PUT  /api/quick-links          needs the edit token: validates and saves a new file
 *   GET  /api/quick-links?history  needs the edit token: the last saved versions
 *
 * The edit token is sent as "Authorization: Bearer <token>". Only one fixed,
 * validated file is ever stored (in Workers KV), so the endpoint can't be used
 * as general storage.
 *
 * Bindings, set in the Pages project settings:
 *   QUICK_LINKS  KV namespace
 *   EDIT_TOKEN   secret, at least 32 characters; editing is off until it is set
 */
import { normalizeQuickLinksConfig, QuickLinksConfig } from '../../src/quickLinksConfig';

interface KVStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface Env {
  QUICK_LINKS: KVStore;
  EDIT_TOKEN?: string;
}

interface Context {
  request: Request;
  env: Env;
}

export interface HistoryEntry {
  savedAt: string;
  config: QuickLinksConfig;
}

const CONFIG_KEY = 'config';
const HISTORY_KEY = 'history';
const MAX_BODY_BYTES = 20_000;
const HISTORY_LENGTH = 20;
const MIN_TOKEN_LENGTH = 32;

const EMPTY_CONFIG: QuickLinksConfig = { defaults: {}, presets: [] };

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const sha256 = async (text: string): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));

/** Compares hashes so the time taken doesn't reveal how much of the token matched. */
const tokensMatch = async (given: string, expected: string): Promise<boolean> => {
  const [a, b] = await Promise.all([sha256(given), sha256(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

/** Returns an error response if the request may not edit, or null if it may. */
const checkEditAccess = async (request: Request, env: Env): Promise<Response | null> => {
  const expected = env.EDIT_TOKEN ?? '';
  if (expected.length < MIN_TOKEN_LENGTH) {
    return json({ errors: ['Editing is not set up: EDIT_TOKEN is missing or shorter than 32 characters.'] }, 503);
  }
  const header = request.headers.get('Authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!(await tokensMatch(given, expected))) {
    return json({ errors: ['Wrong or missing edit token. Check that you opened the full edit link.'] }, 401);
  }
  return null;
};

/** Reads the body as text, or returns null as soon as it grows past the limit. */
const readBody = async (request: Request, limit: number): Promise<string | null> => {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
};

const readHistory = async (env: Env): Promise<HistoryEntry[]> => {
  try {
    const history = JSON.parse((await env.QUICK_LINKS.get(HISTORY_KEY)) ?? '[]');
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
};

export const onRequestGet = async ({ request, env }: Context): Promise<Response> => {
  if (new URL(request.url).searchParams.has('history')) {
    const denied = await checkEditAccess(request, env);
    if (denied) return denied;
    return json(await readHistory(env));
  }

  const stored = await env.QUICK_LINKS.get(CONFIG_KEY);
  return stored === null ? json(EMPTY_CONFIG) : new Response(stored, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

export const onRequestPut = async ({ request, env }: Context): Promise<Response> => {
  const denied = await checkEditAccess(request, env);
  if (denied) return denied;

  const body = await readBody(request, MAX_BODY_BYTES);
  if (body === null) {
    return json({ errors: [`The file is too large: at most ${MAX_BODY_BYTES / 1000} KB is allowed.`] }, 413);
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch (err) {
    return json({ errors: [`Not valid JSON: ${err instanceof Error ? err.message : String(err)}`] }, 400);
  }

  const { config, errors } = normalizeQuickLinksConfig(data);
  if (errors.length > 0) return json({ errors }, 400);

  // Store the validated copy, never the raw upload, so nothing but the known fields is kept.
  const entry: HistoryEntry = { savedAt: new Date().toISOString(), config };
  const history = await readHistory(env);
  await env.QUICK_LINKS.put(CONFIG_KEY, JSON.stringify(config, null, 2));
  await env.QUICK_LINKS.put(HISTORY_KEY, JSON.stringify([entry, ...history].slice(0, HISTORY_LENGTH)));

  return json(entry);
};
