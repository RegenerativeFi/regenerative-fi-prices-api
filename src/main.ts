import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Context } from "hono";
import { fetchTokenAddresses } from "./tokenFetcher.ts";
import { fetchPricesForNetwork } from "./priceFetcher.ts";
import { groupTokensByChainId, isSubgraphOnlyNetwork } from "./utils.ts";
import { KV_PRICE_KEY_PREFIX } from "./config.ts";

const KV_KEY_PREFIX = `${KV_PRICE_KEY_PREFIX}:`;

export interface Env {
  PRICES_KV: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();
app.use("/*", cors());

async function runPriceUpdate(env: Env): Promise<void> {
  const tokens = await fetchTokenAddresses();
  const tokensByChainId = groupTokensByChainId(tokens);

  const updatePricesForChain = async ([chainId, addresses]: [
    string,
    string[],
  ]) => {
    try {
      const prices = await fetchPricesForNetwork(
        Number(chainId),
        addresses,
        isSubgraphOnlyNetwork(Number(chainId)),
      );
      const key = `${KV_KEY_PREFIX}${chainId}`;
      await env.PRICES_KV.put(key, JSON.stringify(prices));
      console.log(
        `Prices updated for chainId ${chainId}:`,
        Object.keys(prices).length,
      );
    } catch (error) {
      console.error(`Failed to update prices for chainId ${chainId}:`, error);
    }
  };

  await Promise.all(Object.entries(tokensByChainId).map(updatePricesForChain));
  console.log("Price update completed for all networks");
}

// Get all tokens across all chains
app.get("/tokens", async (c: Context<{ Bindings: Env }>) => {
  const { PRICES_KV } = c.env;
  const allTokens: Record<string, Record<string, string>> = {};
  const list = await PRICES_KV.list({ prefix: KV_KEY_PREFIX });
  for (const key of list.keys) {
    const chainId = key.name.slice(KV_KEY_PREFIX.length);
    const value = await PRICES_KV.get(key.name, "json");
    allTokens[chainId] = (value as Record<string, string>) ?? {};
  }
  return c.json(allTokens);
});

// Get tokens for a specific chainId
app.get("/tokens/:chainId", async (c: Context<{ Bindings: Env }>) => {
  const chainId = c.req.param("chainId");
  const key = `${KV_KEY_PREFIX}${chainId}`;
  const tokens = await c.env.PRICES_KV.get(key, "json");
  if (tokens) {
    return c.json(tokens as Record<string, string>);
  }
  return c.json({ error: "Tokens not found for this chainId" }, 404);
});

// Dev: manually trigger the price update (same as the cron job). Use when running wrangler dev.
app.get("/dev/trigger-cron", async (c: Context<{ Bindings: Env }>) => {
  await runPriceUpdate(c.env);
  return c.json({ ok: true, message: "Price update completed" });
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return await app.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    console.log("Cron job triggered");
    switch (event.cron) {
      case "*/2 * * * *":
        await runPriceUpdate(env);
        break;
    }
  },
};
