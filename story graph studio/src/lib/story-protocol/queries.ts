// Query functions for Story Protocol data
import { fetchFromStoryAPI } from './client';
import { IPAsset, IPStats } from './types';
import { useMockData, getMockIPAssets } from './mock-data';

export async function fetchIPAssets(params?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<{ data: IPAsset[]; total: number }> {
  // Use mock data for development
  if (useMockData) {
    const mockData = getMockIPAssets();
    const start = params?.offset || 0;
    const end = start + (params?.limit || 100);
    return {
      data: mockData.slice(start, end),
      total: mockData.length,
    };
  }
  
  try {
    // Real Story Protocol API call with v4 format (correct format)
    const result = await fetchFromStoryAPI('/assets', {
      method: 'POST',
      body: JSON.stringify({
        includeLicenses: true,
        moderated: false,
        orderBy: params?.orderBy || 'blockTimestamp',
        orderDirection: params?.orderDirection || 'desc',
        pagination: {
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      }),
    });

    // Map the real API response to our interface
    const assets: IPAsset[] = (result.data || []).map((asset: any) => ({
      id: asset.id,
      ipId: asset.ipId,
      tokenContract: asset.nftMetadata?.tokenContract || asset.tokenContract,
      tokenId: asset.nftMetadata?.tokenId || asset.tokenId,
      chainId: asset.chainId || 1513,
      owner: asset.owner,
      blockNumber: asset.blockNumber,
      blockTimestamp: asset.blockTimestamp,
      metadata: asset.nftMetadata ? {
        name: asset.nftMetadata.name,
        description: asset.nftMetadata.description,
        mediaType: asset.nftMetadata.mediaType,
        imageUrl: asset.nftMetadata.imageUrl,
      } : undefined,
      licenseTerms: asset.licenseTerms || [],
      parents: asset.ancestorIpIds || [],
      children: asset.childIpIds || [],
      totalRevenue: asset.totalRevenue || '0',
    }));

    return {
      data: assets,
      total: result.pagination?.total || assets.length,
    };
  } catch (error) {
    console.error('Error fetching IP assets:', error);
    // Fallback to mock data on error
    console.warn('Falling back to mock data due to API error');
    const mockData = getMockIPAssets();
    const start = params?.offset || 0;
    const end = start + (params?.limit || 100);
    return {
      data: mockData.slice(start, end),
      total: mockData.length,
    };
  }
}

export async function fetchIPAssetById(ipId: string): Promise<IPAsset | null> {
  try {
    const result = await fetchFromStoryAPI(`/assets/${ipId}`);
    return result.data || null;
  } catch (error) {
    console.error(`Error fetching IP asset ${ipId}:`, error);
    return null;
  }
}

export async function fetchIPRelationships(ipId: string): Promise<{
  parents: string[];
  children: string[];
}> {
  try {
    const result = await fetchFromStoryAPI(`/assets/${ipId}/relationships`);
    return {
      parents: result.data?.parents || [],
      children: result.data?.children || [],
    };
  } catch (error) {
    console.error(`Error fetching relationships for ${ipId}:`, error);
    return { parents: [], children: [] };
  }
}

export async function fetchIPLicenses(ipId: string) {
  try {
    const result = await fetchFromStoryAPI(`/assets/${ipId}/licenses`);
    return result.data || [];
  } catch (error) {
    console.error(`Error fetching licenses for ${ipId}:`, error);
    return [];
  }
}

export async function searchIPAssets(query: string, limit = 20): Promise<IPAsset[]> {
  // Use mock data for development
  if (useMockData) {
    const mockData = getMockIPAssets();
    const lowerQuery = query.toLowerCase();
    return mockData.filter(asset => 
      asset.metadata?.name?.toLowerCase().includes(lowerQuery) ||
      asset.ipId.toLowerCase().includes(lowerQuery) ||
      asset.owner.toLowerCase().includes(lowerQuery)
    ).slice(0, limit);
  }

  try {
    // Real Story Protocol search API
    const result = await fetchFromStoryAPI('/assets/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        includeLicenses: true,
        moderated: false,
        pagination: { 
          limit, 
          offset: 0 
        },
      }),
    });

    // Map search results to IPAsset format
    const assets: IPAsset[] = (result.data || []).map((asset: any) => ({
      id: asset.id,
      ipId: asset.ipId,
      tokenContract: asset.nftMetadata?.tokenContract || asset.tokenContract,
      tokenId: asset.nftMetadata?.tokenId || asset.tokenId,
      chainId: asset.chainId || 1513,
      owner: asset.owner,
      blockNumber: asset.blockNumber,
      blockTimestamp: asset.blockTimestamp,
      metadata: asset.nftMetadata ? {
        name: asset.nftMetadata.name,
        description: asset.nftMetadata.description,
        mediaType: asset.nftMetadata.mediaType,
        imageUrl: asset.nftMetadata.imageUrl,
      } : undefined,
      licenseTerms: asset.licenseTerms || [],
      parents: asset.ancestorIpIds || [],
      children: asset.childIpIds || [],
      totalRevenue: asset.totalRevenue || '0',
    }));

    return assets;
  } catch (error) {
    console.error('Error searching IP assets:', error);
    return [];
  }
}

export async function fetchIPStats(): Promise<IPStats> {
  try {
    // This would be a custom aggregation endpoint
    // For now, we'll compute from fetched data
    const { data: assets } = await fetchIPAssets({ limit: 1000 });

    const stats: IPStats = {
      totalIPs: assets.length,
      totalDerivatives: assets.filter(a => a.parents && a.parents.length > 0).length,
      totalRevenue: '0',
      mostRemixedIPs: [],
      licenseDistribution: {},
      mediaTypeDistribution: {},
      ipsOverTime: [],
    };

    // Calculate most remixed
    const derivativeCounts = new Map<string, number>();
    assets.forEach(asset => {
      if (asset.children) {
        derivativeCounts.set(asset.ipId, asset.children.length);
      }
    });

    stats.mostRemixedIPs = Array.from(derivativeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ipId, count]) => ({
        ipId,
        count,
        name: assets.find(a => a.ipId === ipId)?.metadata?.name,
      }));

    // License distribution
    assets.forEach(asset => {
      if (asset.licenseTerms) {
        asset.licenseTerms.forEach(term => {
          const type = term.commercialUse ? 'Commercial' : 'Non-Commercial';
          stats.licenseDistribution[type] = (stats.licenseDistribution[type] || 0) + 1;
        });
      }
    });

    // Media type distribution
    assets.forEach(asset => {
      const type = asset.metadata?.mediaType || 'other';
      stats.mediaTypeDistribution[type] = (stats.mediaTypeDistribution[type] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching IP stats:', error);
    return {
      totalIPs: 0,
      totalDerivatives: 0,
      totalRevenue: '0',
      mostRemixedIPs: [],
      licenseDistribution: {},
      mediaTypeDistribution: {},
      ipsOverTime: [],
    };
  }
}
