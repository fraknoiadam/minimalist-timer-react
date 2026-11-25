# Timer

A minimalistic timer application built with React and TypeScript.

## Features

- Dark and light mode.
- Customizable font size.
- Display custom web content beneath the timer with iframe embedding. It can also cycle through multiple websites at customizable intervals.
- States are automatically saved in local storage, and can be restored on page reload.
- Screen wake lock to prevent device from sleeping.
- Quick links: preset buttons on the start screen, editable by anyone with the secret edit link.

## Quick links

The buttons come from `/api/quick-links`, a Cloudflare Pages Function (`functions/api/quick-links.ts`) that stores one JSON file in Workers KV. Anyone with the edit link `https://<site>/edit#<EDIT_TOKEN>` can change it; everyone else can only read it. Saves are validated (format, `https://` links, 20 KB max) and the last 20 versions are kept.

```json
{
  "defaults": { "linkSwitchDurationSec": 15, "embedFadeOutMin": 10 },
  "presets": [
    { "name": "Results", "links": ["https://example.com/results"] },
    { "name": "Final", "links": ["https://a.com", "https://b.com"], "linkSwitchDurationSec": 30, "darkMode": false }
  ]
}
```

Settings: `links`, `linkSwitchDurationSec`, `embedFadeOutMin`, `darkMode`, `fontSize`, `embedOverflow`, `wakeLockEnabled`. Each can be set in `defaults` and overridden per preset; a setting set in neither is left unchanged when the button is clicked. The full rules are in `src/quickLinksConfig.ts`.

### Cloudflare setup (once)

1. Create a KV namespace, e.g. `quick-links`.
2. In the Pages project's settings, add a KV namespace binding named `QUICK_LINKS` pointing to it, and a secret named `EDIT_TOKEN` (at least 32 characters, e.g. from `openssl rand -hex 32`). Do both for Production, and for Preview if preview deployments should work too.
3. Redeploy. Bindings and secrets only apply to deployments made after they are set.

Editing stays switched off until `EDIT_TOKEN` is set. To revoke every edit link, change the secret and redeploy.

### Local development with the API

```bash
npm run build
echo "EDIT_TOKEN=$(openssl rand -hex 32)" > .dev.vars
npx wrangler pages dev dist --kv QUICK_LINKS
```

Then open `http://localhost:8788/edit#<the token from .dev.vars>`. `npm run dev` alone runs the app without the API, so no quick links are shown.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all tests
npm test
```
