# Cloudflare Pages Configuration

## Deploying as a Cloudflare Worker (Static Assets)

This project is configured for Cloudflare Workers static assets.

### Prerequisites
- `wrangler` (installed automatically via `npx`)

### Deploy
```bash
npx wrangler deploy
```

### Preview locally
```bash
npx wrangler dev
```

### Configuration
- Config: `wrangler.toml`
- Assets directory: `./`
- Worker entry: `src/index.js` (passes through to assets)

### Staging example
```bash
npx wrangler deploy --env staging
```
