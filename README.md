# Regenerative Prices API

This API provides token price data for **Celo only**, primarily sourced from GeckoTerminal with fallback to the Regenerative pools subgraph.

**Live API:** [https://regenerative-prices.deno.dev/tokens](https://regenerative-prices.deno.dev/tokens)

## Features

- Fetches token prices for Celo (chain ID 42220)
- Uses GeckoTerminal as the primary price source
- Falls back to the Regenerative pools subgraph for certain tokens or when GeckoTerminal data is unavailable
- Caches prices in a KV store for efficient retrieval
- Updates prices every 2 minutes via a cron job

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

This project uses Deno for runtime and deployment.

### Prerequisites

- Deno 1.34 or higher

### Local Development

1. Clone the repository
2. Run the development server:

```
deno task start
```

### Deployment

This API is designed to be deployed on Deno Deploy. Follow these steps:

1. Set up a project on Deno Deploy
2. Link your GitHub repository
3. Configure the project to use `main.ts` as the entry point
4. Deploy!

## Configuration

Key configuration options are stored in `src/config.ts`. Modify this file to adjust:

- Subgraph URL (Regenerative pools subgraph on Goldsky)
- Token list URL (Regenerative Celo token list)
- Price update frequency
- GeckoTerminal API settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
