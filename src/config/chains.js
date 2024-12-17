// src/config/chains.js
export const polygonAmoy = {
    id: 80002,
    name: "Polygon Amoy",
    network: "polygon-amoy",
    nativeCurrency: {
      decimals: 18,
      name: "MATIC",
      symbol: "MATIC",
    },
    rpcUrls: {
      public: {
        http: [process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL],
      },
      default: {
        http: [process.env.NEXT_PUBLIC_ALCHEMY_AMOY_URL],
      },
    },
    blockExplorers: {
      default: { name: "Amoy Explorer", url: "https://www.oklink.com/amoy" },
    },
    blockTime: 2.5,
};
  
/*
  export const baseSepolia = {
    id: 84532,
    name: "Base Sepolia",
    network: "base-sepolia",
    nativeCurrency: {
      decimals: 18,
      name: "ETH",
      symbol: "ETH",
    },
    rpcUrls: {
      public: {
        http: [process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL],
      },
      default: {
        http: [process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL],
      },
    },
    blockExplorers: {
      default: { name: "Base Sepolia Explorer", url: "https://sepolia.basescan.org" },
    },
  };

 */