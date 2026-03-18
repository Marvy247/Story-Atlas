import { fetchFromStoryAPI } from './client';
import { IPAsset, IPStats, RawAPIAsset, RawLicense, RawEdge } from './types';
import { useMockData, getMockIPAssets } from './mock-data';

function mapAsset(raw: RawAPIAsset): IPAsset {
  return {
    id: raw.ipId,
    ipId: raw.ipId,
    tokenContract: raw.tokenContract,
    tokenId: raw.tokenId,
    chainId: raw.chainId,
    owner: raw.ownerAddress,
    blockNumber: raw.blockNumber,
    blockTimestamp: raw.registrationDate ? Math.floor(new Date(raw.registrationDate).getTime() / 1000) : 0,
    metadata: {
      name: raw.nftMetadata?.name || raw.name,
      description: raw.nftMetadata?.description ?? undefined,
      imageUrl: raw.nftMetadata?.image?.cachedUrl || raw.nftMetadata?.image?.originalUrl,
    },
    licenseTerms: (raw.licenses || []).map((l: RawLicense) => ({
      id: l.licenseTermsId,
      licenseTermsId: l.licenseTermsId,
      licenseTemplate: l.licenseTemplateId,
      transferable: l.terms.transferable,
      royaltyPolicy: l.terms.royaltyPolicy,
      defaultMintingFee: l.terms.defaultMintingFee,
      currency: l.terms.currency,
      commercialUse: l.terms.commercialUse,
      commercialAttribution: l.terms.commercialAttribution,
      commercializerChecker: l.terms.commercializerChecker,
      derivativesAllowed: l.terms.derivativesAllowed,
      derivativesAttribution: l.terms.derivativesAttribution,
      derivativeApprovalRequired: l.terms.derivativesApproval,
      derivativeRevShare: l.terms.commercialRevShare,
    })),
    parents: [],
    children: [],
    totalRevenue: '0',
  };
}

export async function fetchIPAssets(params?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<{ data: IPAsset[]; total: number }> {
  if (useMockData) {
    const mockData = getMockIPAssets();
    const start = params?.offset || 0;
    return { data: mockData.slice(start, start + (params?.limit || 100)), total: mockData.length };
  }

  const result = await fetchFromStoryAPI('/assets', {
    method: 'POST',
    body: JSON.stringify({
      includeLicenses: true,
      orderBy: params?.orderBy || 'blockNumber',
      orderDirection: params?.orderDirection || 'desc',
      pagination: { limit: params?.limit || 100, offset: params?.offset || 0 },
    }),
  });

  return {
    data: (result.data || []).map(mapAsset),
    total: result.pagination?.total || 0,
  };
}

export async function fetchIPEdges(params?: {
  limit?: number;
  offset?: number;
}): Promise<RawEdge[]> {
  if (useMockData) return [];

  const result = await fetchFromStoryAPI('/assets/edges', {
    method: 'POST',
    body: JSON.stringify({
      pagination: { limit: params?.limit || 500, offset: params?.offset || 0 },
    }),
  });

  return result.data || [];
}

export async function fetchIPAssetById(ipId: string): Promise<IPAsset | null> {
  if (useMockData) {
    return getMockIPAssets().find(a => a.ipId === ipId) || null;
  }

  const result = await fetchFromStoryAPI(`/assets/${ipId}`);
  return result.data ? mapAsset(result.data) : null;
}

export async function searchIPAssets(query: string, limit = 20): Promise<IPAsset[]> {
  if (useMockData) {
    const lowerQuery = query.toLowerCase();
    return getMockIPAssets()
      .filter(a =>
        a.metadata?.name?.toLowerCase().includes(lowerQuery) ||
        a.ipId.toLowerCase().includes(lowerQuery) ||
        a.owner.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }

  // API has no search endpoint — filter from a recent fetch by name match
  const result = await fetchFromStoryAPI('/assets', {
    method: 'POST',
    body: JSON.stringify({
      includeLicenses: false,
      orderBy: 'blockNumber',
      orderDirection: 'desc',
      pagination: { limit: 200, offset: 0 },
    }),
  });

  const lowerQuery = query.toLowerCase();
  return (result.data || [])
    .map(mapAsset)
    .filter((a: IPAsset) =>
      a.metadata?.name?.toLowerCase().includes(lowerQuery) ||
      a.ipId.toLowerCase().includes(lowerQuery) ||
      a.owner.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit);
}

export async function fetchIPStats(): Promise<IPStats> {
  const [{ data: assets }, edges] = await Promise.all([
    fetchIPAssets({ limit: 500 }),
    fetchIPEdges({ limit: 500 }),
  ]);

  // Build children counts from edges
  const childrenCount = new Map<string, number>();
  edges.forEach(e => {
    childrenCount.set(e.parentIpId, (childrenCount.get(e.parentIpId) || 0) + 1);
  });

  const stats: IPStats = {
    totalIPs: assets.length,
    totalDerivatives: edges.length,
    totalRevenue: '0',
    mostRemixedIPs: Array.from(childrenCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ipId, count]) => ({
        ipId,
        count,
        name: assets.find(a => a.ipId === ipId)?.metadata?.name,
      })),
    licenseDistribution: {},
    mediaTypeDistribution: {},
    ipsOverTime: [],
  };

  assets.forEach(asset => {
    (asset.licenseTerms || []).forEach(term => {
      const type = term.commercialUse ? 'Commercial' : 'Non-Commercial';
      stats.licenseDistribution[type] = (stats.licenseDistribution[type] || 0) + 1;
    });
    const type = asset.metadata?.mediaType || 'other';
    stats.mediaTypeDistribution[type] = (stats.mediaTypeDistribution[type] || 0) + 1;
  });

  return stats;
}
