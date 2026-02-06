import { ApiResponse } from "./types.ts";
import {
  FETCH_RETRY_ATTEMPTS,
  FETCH_RETRY_DELAY,
  GECKOTERMINAL_API_BASE_URL,
  GECKOTERMINAL_BATCH_SIZE,
  SUBGRAPH_ONLY_TOKENS,
} from "./config.ts";
import { fetchPricesFromSubgraph } from "./subgraphQueries.ts";
import { platform } from "./utils.ts";

export const fetchPricesForNetwork = async (
  chainId: number,
  addresses: string[],
  subgraphOnly: boolean = false
): Promise<Record<string, string>> => {
  const batchSize = GECKOTERMINAL_BATCH_SIZE;
  const batches = [];
  const maxRetries = FETCH_RETRY_ATTEMPTS;
  const retryDelay = FETCH_RETRY_DELAY; // 1 second

  for (let i = 0; i < addresses.length; i += batchSize) {
    batches.push(addresses.slice(i, i + batchSize));
  }

  const fetchBatch = async (
    batch: string[]
  ): Promise<Record<string, string>> => {
    const prices: Record<string, string> = {};
    const geckoTerminalBatch = batch.filter(
      (address) => !isSubgraphOnlyToken(chainId, address) && !subgraphOnly
    );
    const subgraphOnlyBatch = batch.filter(
      (address) => isSubgraphOnlyToken(chainId, address) || subgraphOnly
    );
    // Fetch prices from GeckoTerminal for non-subgraph-only tokens
    if (geckoTerminalBatch.length > 0) {
      const addressString = geckoTerminalBatch.join(",");
      const url = `${GECKOTERMINAL_API_BASE_URL}/networks/${platform(
        chainId
      )}/tokens/multi/${addressString}`;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const apiResponse: ApiResponse = await response.json();
          for (const token of apiResponse.data) {
            if (token.attributes.price_usd) {
              prices[token.attributes.address] = token.attributes.price_usd;
            }
          }
          break; // Success, exit retry loop
        } catch (error) {
          console.error(
            `Attempt ${attempt + 1} failed for chainId ${chainId}:`,
            error
          );

          if (attempt === maxRetries - 1) {
            console.error(
              `All attempts failed for chainId ${chainId}. Skipping GeckoTerminal batch.`
            );
          } else {
            console.log(`Retrying in ${retryDelay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }
    }

    // Fetch prices from subgraph for subgraph-only tokens and missing prices
    const subgraphBatch = [
      ...subgraphOnlyBatch,
      ...geckoTerminalBatch.filter((address) => !prices[address]),
    ];
    if (subgraphBatch.length > 0) {
      const subgraphPrices = await fetchPricesFromSubgraph(
        chainId,
        subgraphBatch
      );
      Object.assign(prices, subgraphPrices);
    }

    return prices;
  };

  const results = await Promise.all(batches.map(fetchBatch));
  return Object.assign({}, ...results);
};

function isSubgraphOnlyToken(chainId: number, address: string): boolean {
  return (
    SUBGRAPH_ONLY_TOKENS[chainId]?.includes(address.toLowerCase()) || false
  );
}
