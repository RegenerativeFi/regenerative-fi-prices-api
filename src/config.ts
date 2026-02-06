// API and data fetching settings
export const GECKOTERMINAL_API_BASE_URL =
  "https://api.geckoterminal.com/api/v2";
export const TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/RegenerativeFi/regenerative-token-list/refs/heads/main/celo.tokenlist.json";
export const FETCH_RETRY_ATTEMPTS = 2;
export const FETCH_RETRY_DELAY = 1000; // milliseconds

// Batch processing settings
export const GECKOTERMINAL_BATCH_SIZE = 30;
export const SUBGRAPH_BATCH_SIZE = 100; // Adjust based on subgraph limitations

// Cron job settings
export const PRICE_UPDATE_CRON_SCHEDULE = "*/2 * * * *"; // Every 2 minutes

// KV store settings
export const KV_PRICE_KEY_PREFIX = "prices";

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [42220];

// Subgraph URLs
export const SUBGRAPH_URLS: Record<number, string> = {
  42220:
    "https://api.goldsky.com/api/public/project_cmameg3xd03rh01yxazddhlgj/subgraphs/regenerative-pools-subgraph/1.0.0/gn",
};

// Tokens to always fetch from subgraph
export const SUBGRAPH_ONLY_TOKENS: Record<number, string[]> = {
  42220: [],
};
