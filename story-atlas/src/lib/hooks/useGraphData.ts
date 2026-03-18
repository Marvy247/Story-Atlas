'use client';

import { useMemo, useRef } from 'react';
import useSWR from 'swr';
import { useIPAssets } from './useIPAssets';
import { buildGraphData, filterGraphData, calculateGraphMetrics } from '../graph/graph-builder';
import { FilterOptions } from '../story-protocol/types';
import { fetchIPEdges } from '../story-protocol/queries';

export function useGraphData(filters?: FilterOptions) {
  const { assets: rawAssets, isLoading: assetsLoading, isError: assetsError } = useIPAssets();

  const { data: rawEdges = [], isLoading: edgesLoading } = useSWR(
    'ip-edges',
    () => fetchIPEdges({ limit: 500 }),
    { revalidateOnFocus: false, revalidateIfStale: false, revalidateOnReconnect: false, dedupingInterval: 300000 }
  );

  // Stabilize arrays — only update ref when content actually changes (by length + first id)
  const assetsRef = useRef(rawAssets);
  const edgesRef = useRef(rawEdges);
  const assetsSig = `${rawAssets.length}:${rawAssets[0]?.ipId ?? ''}`;
  const edgesSig = `${rawEdges.length}:${rawEdges[0]?.parentIpId ?? ''}`;
  const prevAssetsSig = useRef('');
  const prevEdgesSig = useRef('');

  if (assetsSig !== prevAssetsSig.current) { assetsRef.current = rawAssets; prevAssetsSig.current = assetsSig; }
  if (edgesSig !== prevEdgesSig.current) { edgesRef.current = rawEdges; prevEdgesSig.current = edgesSig; }

  const assets = assetsRef.current;
  const edges = edgesRef.current;

  const searchQuery = filters?.searchQuery;
  const licenseTypes = filters?.licenseTypes;
  const mediaTypes = filters?.mediaTypes;
  const commercialOnly = filters?.commercialOnly;
  const hasDerivatives = filters?.hasDerivatives;

  const graphData = useMemo(() => {
    if (!assets || assets.length === 0) return { nodes: [], edges: [] };

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

    if (!searchQuery && !licenseTypes?.length && !mediaTypes?.length && !commercialOnly && !hasDerivatives) {
      return fullGraph;
    }

    return filterGraphData(fullGraph, { searchQuery, licenseTypes, mediaTypes, commercialOnly, hasDerivatives });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, edges, searchQuery, licenseTypes?.join(','), mediaTypes?.join(','), commercialOnly, hasDerivatives]);

  const metrics = useMemo(() => calculateGraphMetrics(graphData), [graphData]);

  return { graphData, metrics, isLoading: assetsLoading || edgesLoading, isError: assetsError };
}
