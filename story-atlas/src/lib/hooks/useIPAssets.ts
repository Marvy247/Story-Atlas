'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { fetchIPAssets, fetchIPAssetById, fetchIPStats, searchIPAssets } from '../story-protocol/queries';

const PAGE_SIZE = 200;

// Shared paginated hook — all callers share the same SWR cache
export function useIPAssets() {
  const getKey = (pageIndex: number) => ['ip-assets', pageIndex];

  const { data, error, isLoading, size, setSize } = useSWRInfinite(
    getKey,
    ([, page]) => fetchIPAssets({ limit: PAGE_SIZE, offset: (page as number) * PAGE_SIZE }),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  const assets = data ? data.flatMap(d => d.data) : [];
  const total = data?.[0]?.total ?? 0;
  const hasMore = assets.length < total;

  return {
    assets,
    total,
    hasMore,
    isLoading,
    isError: error,
    loadMore: () => setSize(size + 1),
  };
}

export function useIPAsset(ipId: string | null) {
  const { data, error, isLoading } = useSWR(
    ipId ? ['ip-asset', ipId] : null,
    () => ipId ? fetchIPAssetById(ipId) : null,
    { revalidateOnFocus: false }
  );
  return { asset: data, isLoading, isError: error };
}

export function useIPStats() {
  const { data, error, isLoading } = useSWR('ip-stats', fetchIPStats, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });
  return { stats: data, isLoading, isError: error };
}

export function useSearchIPs(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? ['search', query] : null,
    () => searchIPAssets(query),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  return { results: data || [], isLoading, isError: error };
}
