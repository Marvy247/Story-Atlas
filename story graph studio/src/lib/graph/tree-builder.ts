// Build tree structure for genealogy view
import { IPAsset, GraphNode } from '../story-protocol/types';

export interface TreeNode {
  id: string;
  name: string;
  ipId: string;
  children?: TreeNode[];
  parent?: string;
  depth: number;
  metadata?: any;
  collapsed?: boolean;
  derivativeCount: number;
  licenseType: string;
  timestamp: number;
}

export function buildIPTree(rootIpId: string, allAssets: IPAsset[]): TreeNode | null {
  const assetMap = new Map<string, IPAsset>();
  allAssets.forEach(asset => assetMap.set(asset.ipId, asset));

  const rootAsset = assetMap.get(rootIpId);
  if (!rootAsset) return null;

  function buildNode(asset: IPAsset, depth: number, visited: Set<string>): TreeNode {
    if (visited.has(asset.ipId)) {
      // Circular reference detected, return without children
      return {
        id: asset.ipId,
        name: asset.metadata?.name || `IP-${asset.tokenId}`,
        ipId: asset.ipId,
        depth,
        derivativeCount: 0,
        licenseType: getLicenseType(asset),
        timestamp: asset.blockTimestamp,
        collapsed: false,
      };
    }

    visited.add(asset.ipId);

    const children: TreeNode[] = [];
    if (asset.children && asset.children.length > 0) {
      asset.children.forEach(childId => {
        const childAsset = assetMap.get(childId);
        if (childAsset) {
          children.push(buildNode(childAsset, depth + 1, new Set(visited)));
        }
      });
    }

    return {
      id: asset.ipId,
      name: asset.metadata?.name || `IP-${asset.tokenId}`,
      ipId: asset.ipId,
      children: children.length > 0 ? children : undefined,
      depth,
      derivativeCount: children.length,
      licenseType: getLicenseType(asset),
      timestamp: asset.blockTimestamp,
      collapsed: false,
      metadata: asset.metadata,
    };
  }

  return buildNode(rootAsset, 0, new Set());
}

export function buildFullGenealogyTree(allAssets: IPAsset[]): TreeNode[] {
  // Find root nodes (IPs with no parents)
  const roots = allAssets.filter(asset => !asset.parents || asset.parents.length === 0);
  
  return roots.map(root => buildIPTree(root.ipId, allAssets)).filter(Boolean) as TreeNode[];
}

export function getAncestors(ipId: string, allAssets: IPAsset[]): IPAsset[] {
  const assetMap = new Map<string, IPAsset>();
  allAssets.forEach(asset => assetMap.set(asset.ipId, asset));

  const ancestors: IPAsset[] = [];
  const visited = new Set<string>();

  function traverse(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const asset = assetMap.get(currentId);
    if (!asset) return;

    if (asset.parents && asset.parents.length > 0) {
      asset.parents.forEach(parentId => {
        const parent = assetMap.get(parentId);
        if (parent) {
          ancestors.push(parent);
          traverse(parentId);
        }
      });
    }
  }

  traverse(ipId);
  return ancestors;
}

export function getDescendants(ipId: string, allAssets: IPAsset[]): IPAsset[] {
  const assetMap = new Map<string, IPAsset>();
  allAssets.forEach(asset => assetMap.set(asset.ipId, asset));

  const descendants: IPAsset[] = [];
  const visited = new Set<string>();

  function traverse(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const asset = assetMap.get(currentId);
    if (!asset) return;

    if (asset.children && asset.children.length > 0) {
      asset.children.forEach(childId => {
        const child = assetMap.get(childId);
        if (child) {
          descendants.push(child);
          traverse(childId);
        }
      });
    }
  }

  traverse(ipId);
  return descendants;
}

export function calculateTreeDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(calculateTreeDepth));
}

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
