import { SUBGRAPH_URLS } from "./config";

const priceQuery = `
  query getTokenPrices($tokenAddresses: [String!]!) {
    tokens(where: {id_in: $tokenAddresses}) {
      id
      latestUSDPrice
    }
  }
`;

export async function fetchPricesFromSubgraph(
  chainId: number,
  tokenAddresses: string[],
): Promise<Record<string, string>> {
  const subgraphUrl = SUBGRAPH_URLS[chainId];
  if (!subgraphUrl) {
    console.error(`No subgraph URL found for chainId ${chainId}`);
    return {};
  }

  try {
    console.log(
      "Fetching prices from subgraph for chainId",
      chainId,
      subgraphUrl,
    );
    const response = await fetch(subgraphUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: priceQuery,
        variables: {
          tokenAddresses: tokenAddresses.map((addr) => addr.toLowerCase()),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const prices: Record<string, string> = {};
    for (const token of data.data.tokens) {
      if (token.latestUSDPrice) {
        prices[token.id] = token.latestUSDPrice;
      }
    }
    return prices;
  } catch (error) {
    console.error(
      `Failed to fetch prices from subgraph for chainId ${chainId}:`,
      error,
    );
    return {};
  }
}
