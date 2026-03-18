'use client';

import { wagmiAdapter, projectId, storyMainnet } from '../config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [storyMainnet],
    defaultNetwork: storyMainnet,
    metadata: {
      name: 'Story Atlas',
      description: 'Interactive IP Relationship Explorer for Story Protocol',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://storyatlas.xyz',
      icons: [],
    },
  });
}

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
