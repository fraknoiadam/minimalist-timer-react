import {
  getAppSettingsOverrides,
  normalizeQuickLinksConfig,
  resolveQuickLinkPresets,
} from '../quickLinksConfig';

describe('normalizeQuickLinksConfig', () => {
  it('accepts a valid file without errors', () => {
    const data = {
      defaults: { linkSwitchDurationSec: 15, embedFadeOutMin: 10, darkMode: true },
      presets: [
        { name: 'Results', links: ['https://example.com/results'] },
        {
          name: 'Final',
          links: ['https://a.com', 'https://b.com'],
          linkSwitchDurationSec: 30,
          embedFadeOutMin: 0,
          darkMode: false,
          fontSize: 12,
          embedOverflow: false,
          wakeLockEnabled: true,
        },
      ],
    };

    expect(normalizeQuickLinksConfig(data)).toEqual({ config: data, errors: [] });
  });

  it('accepts a file without defaults', () => {
    expect(normalizeQuickLinksConfig({ presets: [] })).toEqual({
      config: { defaults: {}, presets: [] },
      errors: [],
    });
  });

  it('trims names and links', () => {
    const { config, errors } = normalizeQuickLinksConfig({
      presets: [{ name: ' Final ', links: ['  https://a.com '] }],
    });
    expect(errors).toEqual([]);
    expect(config.presets).toEqual([{ name: 'Final', links: ['https://a.com'] }]);
  });

  it('drops invalid values and reports each of them', () => {
    const { config, errors } = normalizeQuickLinksConfig({
      defaults: { linkSwitchDurationSec: 0, darkMode: 'no' },
      presets: [{
        name: 'Final',
        links: ['https://a.com', 'http://insecure.com', 'not a url', 42],
        embedFadeOutMin: '10',
        fontSize: -1,
        wakeLockEnabled: 1,
      }],
    });

    expect(config).toEqual({ defaults: {}, presets: [{ name: 'Final', links: ['https://a.com'] }] });
    expect(errors).toHaveLength(8);
  });

  it('reports unknown fields, which could hold arbitrary data', () => {
    const { config, errors } = normalizeQuickLinksConfig({
      extra: 'x',
      defaults: { name: 'Not allowed here', payload: 'x' },
      presets: [{ name: 'Final', links: ['https://a.com'], linkSwitchDurationSecs: 5 }],
    });

    expect(config).toEqual({ defaults: {}, presets: [{ name: 'Final', links: ['https://a.com'] }] });
    expect(errors).toEqual([
      'Unknown top-level field "extra".',
      'defaults: unknown field "name".',
      'defaults: unknown field "payload".',
      'preset "Final": unknown field "linkSwitchDurationSecs".',
    ]);
  });

  it('skips presets without a valid, unique name', () => {
    const { config, errors } = normalizeQuickLinksConfig({
      presets: [
        { links: ['https://a.com'] },
        { name: '  ', links: ['https://a.com'] },
        { name: 'x'.repeat(101) },
        'https://a.com',
        { name: 'Valid', links: ['https://b.com'] },
        { name: 'Valid', links: ['https://c.com'] },
      ],
    });

    expect(config.presets).toEqual([{ name: 'Valid', links: ['https://b.com'] }]);
    expect(errors).toHaveLength(5);
  });

  it('enforces the limits on presets and links', () => {
    const tooManyLinks = Array.from({ length: 21 }, (_, i) => `https://example.com/${i}`);
    const tooManyPresets = Array.from({ length: 51 }, (_, i) => ({ name: `P${i}` }));

    const links = normalizeQuickLinksConfig({ presets: [{ name: 'Final', links: tooManyLinks }] });
    expect(links.config.presets[0].links).toHaveLength(20);
    expect(links.errors).toHaveLength(1);

    const presets = normalizeQuickLinksConfig({ presets: tooManyPresets });
    expect(presets.config.presets).toHaveLength(50);
    expect(presets.errors).toHaveLength(1);

    const longUrl = `https://example.com/${'x'.repeat(2000)}`;
    expect(normalizeQuickLinksConfig({ presets: [{ name: 'Final', links: [longUrl] }] }).errors).toHaveLength(1);
  });

  it('rejects an empty links list', () => {
    const { config, errors } = normalizeQuickLinksConfig({ presets: [{ name: 'Final', links: [] }] });
    expect(config.presets).toEqual([{ name: 'Final' }]);
    expect(errors).toHaveLength(1);
  });

  it('reports a file that is not an object with a presets list', () => {
    for (const data of [null, [], 'https://a.com', { Results: 'https://a.com' }, { presets: {} }]) {
      const { config, errors } = normalizeQuickLinksConfig(data);
      expect(config.presets).toEqual([]);
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});

describe('resolveQuickLinkPresets', () => {
  it('merges each preset over the defaults, keeping list order', () => {
    expect(resolveQuickLinkPresets({
      defaults: { links: ['https://default.com'], linkSwitchDurationSec: 15, darkMode: true },
      presets: [
        { name: 'Default' },
        { name: 'Final', links: ['https://a.com', 'https://b.com'], darkMode: false },
      ],
    })).toEqual([
      {
        name: 'Default',
        settings: { links: ['https://default.com'], linkSwitchDurationSec: 15, darkMode: true },
      },
      {
        name: 'Final',
        settings: { links: ['https://a.com', 'https://b.com'], linkSwitchDurationSec: 15, darkMode: false },
      },
    ]);
  });
});

describe('getAppSettingsOverrides', () => {
  it('returns only the app settings that are set', () => {
    expect(getAppSettingsOverrides({
      links: ['https://a.com'],
      linkSwitchDurationSec: 15,
      darkMode: false,
      wakeLockEnabled: true,
    })).toEqual({ darkMode: false, wakeLockEnabled: true });
  });

  it('returns an empty object when no app setting is set', () => {
    expect(getAppSettingsOverrides({ links: ['https://a.com'] })).toEqual({});
  });
});
