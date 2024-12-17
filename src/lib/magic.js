// src/lib/magic.js
import { Magic } from 'magic-sdk';

const createMagic = () => {
  return typeof window !== 'undefined' && new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY, {
    network: {
      chainId: 80002, // amoy testnet
      rpcUrl: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL
    }
  });
};

export const magic = createMagic();
