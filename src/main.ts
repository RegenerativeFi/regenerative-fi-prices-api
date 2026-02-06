import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { fetchTokenAddresses } from "./tokenFetcher.ts";
import { fetchPricesForNetwork } from "./priceFetcher.ts";
import { groupTokensByChainId, isSubgraphOnlyNetwork } from "./utils.ts";
import { PRICE_UPDATE_CRON_SCHEDULE, KV_PRICE_KEY_PREFIX } from "./config.ts";

const app = new Hono();
app.use("/*", cors());

const kv = await Deno.openKv();

// Cron job to update prices
Deno.cron("Fetch Prices", PRICE_UPDATE_CRON_SCHEDULE, async () => {
  const tokens = await fetchTokenAddresses();
  const tokensByChainId = groupTokensByChainId(tokens);

  const updatePricesForChain = async ([chainId, addresses]: [
    string,
    string[]
  ]) => {
    try {
      const prices = await fetchPricesForNetwork(
        Number(chainId),
        addresses,
        isSubgraphOnlyNetwork(Number(chainId))
      );
      await kv.set([KV_PRICE_KEY_PREFIX, Number(chainId)], prices);
      console.log(
        `Prices updated for chainId ${chainId}:`,
        Object.keys(prices).length
      );
    } catch (error) {
      console.error(`Failed to update prices for chainId ${chainId}:`, error);
    }
  };

  await Promise.all(Object.entries(tokensByChainId).map(updatePricesForChain));
  console.log("Price update completed for all networks");
});

// Get all tokens across all chains
app.get("/tokens", async (c: Context) => {
  const allTokens: Record<string, Record<string, string>> = {};
  const entries = kv.list({ prefix: [KV_PRICE_KEY_PREFIX] });
  for await (const entry of entries) {
    const [_, chainId] = entry.key;
    allTokens[chainId.toString()] = entry.value as Record<string, string>;
  }
  return c.json(allTokens);
});

// Get tokens for a specific chainId
app.get("/tokens/:chainId", async (c: Context) => {
  const chainId = c.req.param("chainId");
  const tokens = await kv.get(["prices", Number(chainId)]);
  if (tokens.value) {
    return c.json(tokens.value);
  } else {
    return c.json({ error: "Tokens not found for this chainId" }, 404);
  }
});

Deno.serve(app.fetch);
