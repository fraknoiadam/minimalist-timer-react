/**
 * @jest-environment node
 */
import { Env, HistoryEntry, onRequestGet, onRequestPut } from '../../../functions/api/quick-links';

const TOKEN = 'a'.repeat(64);
const URL_BASE = 'https://timer.example/api/quick-links';

const makeEnv = (token: string | null = TOKEN) => {
  const store = new Map<string, string>();
  const env: Env = {
    EDIT_TOKEN: token ?? undefined,
    QUICK_LINKS: {
      get: async (key: string) => store.get(key) ?? null,
      put: async (key: string, value: string) => {
        store.set(key, value);
      },
    },
  };
  return { env, store };
};

const get = (env: Env, { history = false, token }: { history?: boolean; token?: string } = {}) =>
  onRequestGet({
    env,
    request: new Request(history ? `${URL_BASE}?history` : URL_BASE, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  });

const put = (env: Env, body: unknown, token: string | null = TOKEN) =>
  onRequestPut({
    env,
    request: new Request(URL_BASE, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  });

const validConfig = {
  defaults: { linkSwitchDurationSec: 15 },
  presets: [{ name: 'Final', links: ['https://a.com', 'https://b.com'], darkMode: false }],
};

describe('GET /api/quick-links', () => {
  it('returns an empty file before anything is saved', async () => {
    const { env } = makeEnv();
    const response = await get(env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ defaults: {}, presets: [] });
  });

  it('is public, and returns what was saved', async () => {
    const { env } = makeEnv();
    await put(env, validConfig);
    const response = await get(env);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual(validConfig);
  });
});

describe('PUT /api/quick-links', () => {
  it('saves a valid file', async () => {
    const { env, store } = makeEnv();
    const response = await put(env, validConfig);
    expect(response.status).toBe(200);
    expect((await response.json()).config).toEqual(validConfig);
    expect(JSON.parse(store.get('config')!)).toEqual(validConfig);
  });

  it.each([
    ['no token', null],
    ['a wrong token', 'b'.repeat(64)],
    ['a prefix of the token', TOKEN.slice(0, 32)],
  ])('refuses %s', async (_, token) => {
    const { env, store } = makeEnv();
    const response = await put(env, validConfig, token);
    expect(response.status).toBe(401);
    expect(store.size).toBe(0);
  });

  it.each([
    ['is not set', null],
    ['is empty', ''],
    ['is too short', 'short'],
  ])('refuses all edits while EDIT_TOKEN %s', async (_, configured) => {
    const { env, store } = makeEnv(configured);
    const response = await put(env, validConfig, configured || 'anything');
    expect(response.status).toBe(503);
    expect(store.size).toBe(0);
  });

  it('refuses invalid JSON', async () => {
    const { env, store } = makeEnv();
    const response = await put(env, '{ "presets": [');
    expect(response.status).toBe(400);
    expect((await response.json()).errors[0]).toMatch(/Not valid JSON/);
    expect(store.size).toBe(0);
  });

  it('refuses a file with errors and lists them', async () => {
    const { env, store } = makeEnv();
    const response = await put(env, { presets: [{ name: 'Final', links: ['http://a.com'], extra: 'x' }] });
    expect(response.status).toBe(400);
    expect((await response.json()).errors).toHaveLength(2);
    expect(store.size).toBe(0);
  });

  it('refuses a body over 20 KB', async () => {
    const { env, store } = makeEnv();
    const response = await put(env, `{"presets":[],"x":"${'x'.repeat(20_000)}"}`);
    expect(response.status).toBe(413);
    expect(store.size).toBe(0);
  });
});

describe('GET /api/quick-links?history', () => {
  it('needs the token', async () => {
    const { env } = makeEnv();
    expect((await get(env, { history: true })).status).toBe(401);
    expect((await get(env, { history: true, token: 'b'.repeat(64) })).status).toBe(401);
  });

  it('lists saved versions newest first, keeping the last 20', async () => {
    const { env } = makeEnv();
    for (let i = 1; i <= 22; i++) {
      await put(env, { presets: [{ name: `Version ${i}` }] });
    }

    const response = await get(env, { history: true, token: TOKEN });
    expect(response.status).toBe(200);
    const history: HistoryEntry[] = await response.json();
    expect(history).toHaveLength(20);
    expect(history[0].config.presets[0].name).toBe('Version 22');
    expect(history[19].config.presets[0].name).toBe('Version 3');
    expect(typeof history[0].savedAt).toBe('string');
  });
});
