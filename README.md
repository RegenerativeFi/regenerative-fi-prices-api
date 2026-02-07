# Regenerative Prices API

This API provides token price data for **Celo only**, primarily sourced from GeckoTerminal with fallback to the Regenerative pools subgraph.

Deployed on **Cloudflare Workers** with a cron trigger to refresh prices every 2 minutes.

## Features

- Fetches token prices for Celo (chain ID 42220)
- Uses GeckoTerminal as the primary price source
- Falls back to the Regenerative pools subgraph for certain tokens or when GeckoTerminal data is unavailable
- Caches prices in Cloudflare KV for efficient retrieval
- Updates prices every 2 minutes via a Cloudflare Cron Trigger

## API Endpoints

### Get All Token Prices

```
GET /tokens
```

Returns prices for all tokens on Celo.

### Get Token Prices for Celo

```
GET /tokens/42220
```

Returns prices for all tokens on Celo (chain ID 42220).

## Development

This project uses **Cloudflare Workers** with Wrangler.

### Prerequisites

- Node.js 18+
- A Cloudflare account

### First-time setup: KV namespace

Create a KV namespace for caching prices and set its ID in `wrangler.toml`:

```bash
npx wrangler kv:namespace create PRICES_KV
```

Copy the returned `id` and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` in `wrangler.toml` under `[[kv_namespaces]]`.

For local development, create a preview namespace as well:

```bash
npx wrangler kv:namespace create PRICES_KV --preview
```

Add a `preview_id` under the same `[[kv_namespaces]]` in `wrangler.toml` if you want to test KV in dev.

### Install and run

```bash
bun install
bun run dev
```

The API runs at `http://localhost:8787`. The cron does **not** run on a timer in dev; trigger it manually in either way:

**Option A – dev route (easiest):**
```bash
curl http://localhost:8787/dev/trigger-cron
```

**Option B – Wrangler’s scheduled endpoint** (requires `--test-scheduled`):
```bash
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

### Deploy

```bash
bun run deploy
```

Ensure you’re logged in (`npx wrangler login`) and that the KV namespace ID in `wrangler.toml` matches the one created for your account.

## Configuration

- **Cron schedule:** `wrangler.toml` → `[triggers]` → `crons` (default: every 2 minutes).
- **App config:** `src/config.ts` — subgraph URL, token list URL, batch sizes, etc.

## License

[MIT License](src/LICENSE)
