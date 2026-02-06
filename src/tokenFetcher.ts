import { Token, TokenList } from "./types.ts";
import { TOKEN_LIST_URL } from "./config.ts";

export const fetchTokenAddresses = async (): Promise<Token[]> => {
  const response = await fetch(TOKEN_LIST_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: TokenList = await response.json();
  return data.tokens;
};
