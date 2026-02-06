export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens: Token[];
  keywords?: string[];
  tags?: Record<string, {
    name: string;
    description: string;
  }>;
}

export interface ApiResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      address: string;
      price_usd: string;
      // ... other attributes
    };
  }[];
}