import { defineChain } from 'viem';

export const storyMainnet = defineChain({
  id: 1514,
  name: 'Story',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'StoryScan', url: 'https://www.storyscan.io' },
  },
});

export const STORY_API_BASE_URL =
  process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';

export const EXPLORER_URL = 'https://explorer.story.foundation';

export async function fetchFromStoryAPI(endpoint: string, options?: RequestInit) {
  const url = `${STORY_API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (process.env.NEXT_PUBLIC_STORY_API_KEY) {
    headers['X-Api-Key'] = process.env.NEXT_PUBLIC_STORY_API_KEY;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`Story API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
