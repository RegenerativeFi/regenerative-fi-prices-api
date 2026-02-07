import { Token } from "./types";
import { SUPPORTED_CHAIN_IDS } from "./config";

export const groupTokensByChainId = (
  tokens: Token[],
): Record<number, string[]> => {
  return tokens.reduce(
    (acc, token) => {
      if (SUPPORTED_CHAIN_IDS.includes(token.chainId)) {
        if (!acc[token.chainId]) {
          acc[token.chainId] = [];
        }
        acc[token.chainId].push(token.address);
      }
      return acc;
    },
    {} as Record<number, string[]>,
  );
};

export const platform = (chainId: number): string => {
  switch (chainId) {
    case 41:
    case 40:
      return "tlos";
    case 82:
      return "mtr";
    case 42220:
      return "celo";
    case 167000:
      return "taiko";
    case 42793:
      return "etherlink";
    case 11820:
      return "artela";
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

export const isSubgraphOnlyNetwork = (chainId: number): boolean => {
  return chainId === 11820 || chainId === 11822;
};
