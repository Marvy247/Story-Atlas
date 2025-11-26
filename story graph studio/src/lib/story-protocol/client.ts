// Story Protocol SDK Client Setup
import { defineChain } from 'viem';

// Define Story Odyssey chain
export const odyssey = defineChain({
  id: 1513,
  name: 'Story Odyssey Testnet',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://odyssey.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://odyssey.storyscan.xyz' },
  },
  testnet: true,
});

// Note: We use the REST API directly via fetchFromStoryAPI instead of the SDK client
// This avoids chainId compatibility issues and works better for our use case

// API endpoints - Updated to real Story Protocol API
export const STORY_API_BASE_URL = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';

// Helper to fetch from Story API
export async function fetchFromStoryAPI(endpoint: string, options?: RequestInit) {
  const url = `${STORY_API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(process.env.NEXT_PUBLIC_STORY_API_KEY && {
      'X-Api-Key': process.env.NEXT_PUBLIC_STORY_API_KEY,
    }),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Story API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Chain configuration
export const SUPPORTED_CHAIN = odyssey;

// Graph explorer URL
export const EXPLORER_URL = 'https://explorer.story.foundation';
