// Build graph data structure from IP assets
import { IPAsset, GraphNode, GraphEdge, GraphData, FilterOptions } from '../story-protocol/types';

export function buildGraphData(assets: IPAsset[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, GraphNode>();

  // Create nodes
  assets.forEach(asset => {
    const node: GraphNode = {
      id: asset.ipId,
      ipId: asset.ipId,
      name: asset.metadata?.name || `IP-${asset.tokenId}`,
      owner: asset.owner,
      timestamp: asset.blockTimestamp,
      mediaType: asset.metadata?.mediaType,
      imageUrl: asset.metadata?.imageUrl,
      licenseType: getLicenseType(asset),
      derivativeCount: asset.children?.length || 0,
      parentCount: asset.parents?.length || 0,
      revenue: parseFloat(asset.totalRevenue || '0'),
      commercialUse: hasCommercialUse(asset),
    };

    nodes.push(node);
    nodeMap.set(asset.ipId, node);
  });

  // Create edges (parent -> child relationships)
  assets.forEach(asset => {
    if (asset.parents && asset.parents.length > 0) {
      asset.parents.forEach(parentId => {
        if (nodeMap.has(parentId)) {
          edges.push({
            source: parentId,
            target: asset.ipId,
            type: 'derivative',
            royaltyShare: getRoyaltyShare(asset),
          });
        }
      });
    }
  });

  return { nodes, edges };
}

export function filterGraphData(
  graphData: GraphData,
  filters: FilterOptions
): GraphData {
  let filteredNodes = [...graphData.nodes];

  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredNodes = filteredNodes.filter(
      node =>
        node.name.toLowerCase().includes(query) ||
        node.ipId.toLowerCase().includes(query) ||
        node.owner.toLowerCase().includes(query)
    );
  }

  // License types
  if (filters.licenseTypes && filters.licenseTypes.length > 0) {
    filteredNodes = filteredNodes.filter(node =>
      filters.licenseTypes!.includes(node.licenseType)
    );
  }

  // Media types
  if (filters.mediaTypes && filters.mediaTypes.length > 0) {
    filteredNodes = filteredNodes.filter(
      node => node.mediaType && filters.mediaTypes!.includes(node.mediaType)
    );
  }

  // Date range
  if (filters.dateRange) {
    filteredNodes = filteredNodes.filter(
      node =>
        node.timestamp >= filters.dateRange!.start &&
        node.timestamp <= filters.dateRange!.end
    );
  }

  // Revenue range
  if (filters.minRevenue !== undefined) {
    filteredNodes = filteredNodes.filter(node => node.revenue >= filters.minRevenue!);
  }
  if (filters.maxRevenue !== undefined) {
    filteredNodes = filteredNodes.filter(node => node.revenue <= filters.maxRevenue!);
  }

  // Commercial only
  if (filters.commercialOnly) {
    filteredNodes = filteredNodes.filter(node => node.commercialUse);
  }

  // Has derivatives
  if (filters.hasDerivatives) {
    filteredNodes = filteredNodes.filter(node => node.derivativeCount > 0);
  }

  // Filter edges to only include nodes that passed filters
  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graphData.edges.filter(
    edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}

export function calculateGraphMetrics(graphData: GraphData) {
  const metrics = {
    totalNodes: graphData.nodes.length,
    totalEdges: graphData.edges.length,
    avgDegree: 0,
    maxDepth: 0,
    isolatedNodes: 0,
  };

  // Calculate average degree
  const degreeMap = new Map<string, number>();
  graphData.edges.forEach(edge => {
    degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
    degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
  });

  if (degreeMap.size > 0) {
    const totalDegree = Array.from(degreeMap.values()).reduce((sum, deg) => sum + deg, 0);
    metrics.avgDegree = totalDegree / degreeMap.size;
  }

  // Count isolated nodes
  metrics.isolatedNodes = graphData.nodes.filter(node => !degreeMap.has(node.id)).length;

  return metrics;
}

// Helper functions
function getLicenseType(asset: IPAsset): string {
  if (!asset.licenseTerms || asset.licenseTerms.length === 0) {
    return 'None';
  }

  const term = asset.licenseTerms[0];
  if (term.commercialUse && term.derivativesAllowed) {
    return 'Commercial Remix';
  } else if (term.commercialUse) {
    return 'Commercial';
  } else if (term.derivativesAllowed) {
    return 'Non-Commercial Remix';
  } else {
    return 'Attribution Only';
  }
}

function hasCommercialUse(asset: IPAsset): boolean {
  return asset.licenseTerms?.some(term => term.commercialUse) || false;
}

function getRoyaltyShare(asset: IPAsset): number {
  return asset.licenseTerms?.[0]?.derivativeRevShare || 0;
}

export function exportGraphAsJSON(graphData: GraphData): string {
  return JSON.stringify(graphData, null, 2);
}

export function getNodeColor(node: GraphNode): string {
  // Color by license type
  const colorMap: { [key: string]: string } = {
    'Commercial Remix': '#10b981', // green
    'Commercial': '#3b82f6', // blue
    'Non-Commercial Remix': '#f59e0b', // amber
    'Attribution Only': '#8b5cf6', // purple
    'None': '#6b7280', // gray
  };

  return colorMap[node.licenseType] || '#6b7280';
}

export function getNodeSize(node: GraphNode): number {
  const baseSize = 10;
  const scaleFactor = 4;
  return baseSize + Math.log(node.derivativeCount + 1) * scaleFactor;
}
