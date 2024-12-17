// src/app/providers/WalletProvider.js
"use client"

import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { publicProvider } from 'wagmi/providers/public';
import { polygonAmoy } from '@/config/chains';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const { chains } = configureChains(
  [polygonAmoy],
  [publicProvider()]
);

const config = createConfig(
  getDefaultConfig({
    appName: "Offbeat Greets",
    chains,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  })
);

export function WalletProvider({ children }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}