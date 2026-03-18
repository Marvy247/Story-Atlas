'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { useIPAssets } from './useIPAssets';
import { buildGraphData, filterGraphData, calculateGraphMetrics } from '../graph/graph-builder';
import { FilterOptions } from '../story-protocol/types';
import { fetchIPEdges } from '../story-protocol/queries';

export function useGraphData(filters?: FilterOptions) {
  const { assets, isLoading: assetsLoading, isError: assetsError } = useIPAssets();

  const { data: edges = [], isLoading: edgesLoading } = useSWR(
    'ip-edges',
    () => fetchIPEdges({ limit: 500 }),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const graphData = useMemo(() => {
    if (!assets || assets.length === 0) return { nodes: [], edges: [] };

    // Attach parent/child arrays from edges
    const parentMap = new Map<string, string[]>();
    const childMap = new Map<string, string[]>();
    edges.forEach(e => {
      if (!parentMap.has(e.childIpId)) parentMap.set(e.childIpId, []);
      parentMap.get(e.childIpId)!.push(e.parentIpId);
      if (!childMap.has(e.parentIpId)) childMap.set(e.parentIpId, []);
      childMap.get(e.parentIpId)!.push(e.childIpId);
    });

    const enriched = assets.map(a => ({
      ...a,
      parents: parentMap.get(a.ipId) || [],
      children: childMap.get(a.ipId) || [],
    }));

    const fullGraph = buildGraphData(enriched);
    return filters ? filterGraphData(fullGraph, filters) : fullGraph;
  }, [assets, edges, filters]);

  const metrics = useMemo(() => calculateGraphMetrics(graphData), [graphData]);

  return {
    graphData,
    metrics,
    isLoading: assetsLoading || edgesLoading,
    isError: assetsError,
  };
}
