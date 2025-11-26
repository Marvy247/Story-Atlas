// Enhanced realistic mock data for development
import { IPAsset } from './types';

export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Realistic IP name templates by category
const IP_TEMPLATES = {
  music: [
    'Ethereal Dreams', 'Midnight Symphony', 'Digital Horizon', 'Urban Beats', 'Cosmic Rhythm',
    'Neon Nights', 'Electric Soul', 'Jazz Fusion', 'Synthwave Sunrise', 'Bass Drop',
    'Melodic Journey', 'Acoustic Vibes', 'Lo-Fi Dreams', 'Epic Orchestral', 'Tribal Drums',
    'Retro Wave', 'Future Bass', 'Ambient Space', 'Cinematic Score', 'Hip Hop Anthem',
  ],
  art: [
    'Abstract Expression', 'Digital Renaissance', 'Cyber Landscape', 'Neon Portrait', 'Pixel Dreams',
    'Geometric Harmony', 'Surreal Vision', 'Color Symphony', 'Modern Mythology', 'Urban Canvas',
    'Fractal Beauty', 'AI Genesis', 'Ethereal Portrait', 'Cosmic Bloom', 'Digital Sculpture',
    'Glitch Art', 'Vaporwave Aesthetic', 'Minimalist Design', 'Pop Art Revival', 'Street Mural',
  ],
  video: [
    'Story Protocol Origins', 'Behind the Scenes', 'Creative Process', 'Time Lapse Journey', 'Animation Reel',
    'Documentary: The Future', 'Music Video', 'Short Film', 'Tutorial Series', 'Vlog Episode',
    'Game Trailer', 'Product Showcase', 'Event Highlights', 'Interview Series', 'Cinematic Adventure',
    'Motion Graphics', 'Stop Motion', 'Visual Effects Demo', 'Travel Diary', '3D Animation',
  ],
  game: [
    'Quest for Glory', 'Cyber Warriors', 'Magic Realms', 'Space Odyssey', 'Dragon Legends',
    'Puzzle Master', 'Racing Thunder', 'Battle Arena', 'RPG Chronicles', 'Platform Jump',
    'Strategy Empire', 'Card Battles', 'Survival Island', 'Zombie Defense', 'Medieval Quest',
    'Pixel Adventures', 'Boss Rush', 'Tower Defense', 'Idle Clicker', 'Match Three Saga',
  ],
  character: [
    'Captain Nova', 'Shadow Hunter', 'Pixel Knight', 'Cyber Samurai', 'Magic Mage',
    'Space Explorer', 'Dragon Rider', 'Robot Guardian', 'Mystic Warrior', 'Time Traveler',
    'Neon Ninja', 'Cosmic Hero', 'Dark Sorcerer', 'Ice Queen', 'Thunder God',
    'Steampunk Pilot', 'Crystal Wizard', 'Void Walker', 'Fire Elemental', 'Ocean Guardian',
  ],
};

const DERIVATIVE_PREFIXES = [
  'Remix', 'Remastered', 'Extended', 'Cover', 'Inspired by', 'Tribute to',
  'Variation of', 'Based on', 'Reimagined', 'V2', 'Enhanced', 'Deluxe',
  'Director\'s Cut', 'Special Edition', 'Ultimate', 'Redux',
];

// Helper to generate random Ethereum address
const randomAddress = () => `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`;

// Helper to generate random IP ID
const randomIpId = () => `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`;

// Generate realistic names
function generateName(category: string, isDerivative: boolean, parentName?: string): string {
  if (isDerivative && parentName) {
    const prefix = DERIVATIVE_PREFIXES[Math.floor(Math.random() * DERIVATIVE_PREFIXES.length)];
    return `${prefix} "${parentName}"`;
  }
  
  const templates = IP_TEMPLATES[category as keyof typeof IP_TEMPLATES] || IP_TEMPLATES.art;
  const base = templates[Math.floor(Math.random() * templates.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return Math.random() > 0.6 ? `${base} #${number}` : base;
}

// Generate realistic descriptions
function generateDescription(category: string, name: string, isDerivative: boolean): string {
  const descriptions = {
    music: [
      `Original musical composition blending modern production with timeless melodies.`,
      `Exclusive audio track featuring innovative sound design and production.`,
      `High-quality music with commercial licensing available through Story Protocol.`,
      `Professional recording with stems and project files included.`,
    ],
    art: [
      `Digital artwork created using cutting-edge AI-assisted tools and human creativity.`,
      `Hand-crafted visual masterpiece exploring themes of technology and nature.`,
      `Limited edition digital art with verified provenance and authenticity.`,
      `Museum-quality artwork available for commercial use and derivative works.`,
    ],
    video: [
      `High-quality video content showcasing professional storytelling and cinematography.`,
      `Original content featuring 4K resolution and color-graded footage.`,
      `Cinematic production available for licensing, remixing, and commercial use.`,
      `Professional video with full rights management through Story Protocol.`,
    ],
    game: [
      `Interactive gaming experience with unique mechanics and polished design.`,
      `Game assets and source code ready for integration into derivative projects.`,
      `Original game concept with modular components perfect for remixing.`,
      `Complete game package with documentation and commercial licensing.`,
    ],
    character: [
      `Original character design with detailed backstory, attributes, and lore.`,
      `IP character with full commercial rights ready for cross-media adaptation.`,
      `Fully documented character with style guide and usage guidelines.`,
      `Premium character asset with 3D model, rigging, and animation data.`,
    ],
  };
  
  const categoryDescriptions = descriptions[category as keyof typeof descriptions] || descriptions.art;
  const baseDesc = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  
  if (isDerivative) {
    return `${baseDesc} This is a derivative work building upon "${name}" with new creative elements.`;
  }
  
  return baseDesc;
}

// Generate enhanced mock IP assets
let cachedMockAssets: IPAsset[] | null = null;

export function getMockIPAssets(): IPAsset[] {
  // Return cached version if exists
  if (cachedMockAssets) return cachedMockAssets;
  
  const mockAssets: IPAsset[] = [];
  const totalAssets = 500; // 5x increase from 100
  
  // License types with realistic distribution weights
  const licenseTypes = [
    { commercialUse: true, derivativesAllowed: true, commercialRevShare: 10, weight: 35 },
    { commercialUse: true, derivativesAllowed: true, commercialRevShare: 5, weight: 25 },
    { commercialUse: false, derivativesAllowed: true, commercialRevShare: 0, weight: 20 },
    { commercialUse: true, derivativesAllowed: true, commercialRevShare: 15, weight: 10 },
    { commercialUse: true, derivativesAllowed: false, commercialRevShare: 0, weight: 7 },
    { commercialUse: false, derivativesAllowed: false, commercialRevShare: 0, weight: 3 },
  ];
  
  // Weighted random license selection
  const getRandomLicense = () => {
    const totalWeight = licenseTypes.reduce((sum, l) => sum + l.weight, 0);
    let random = Math.random() * totalWeight;
    for (const license of licenseTypes) {
      random -= license.weight;
      if (random <= 0) {
        return {
          id: `license-${Math.random().toString(36).substr(2, 9)}`,
          licenseTermsId: Math.floor(Math.random() * 1000).toString(),
          licenseTemplate: randomAddress(),
          transferable: true,
          royaltyPolicy: randomAddress(),
          defaultMintingFee: (Math.random() * 0.1).toFixed(4),
          currency: randomAddress(),
          commercialUse: license.commercialUse,
          commercialAttribution: true,
          commercializerChecker: randomAddress(),
          derivativesAllowed: license.derivativesAllowed,
          derivativesAttribution: true,
          derivativeApprovalRequired: false,
          derivativeRevShare: license.commercialRevShare,
        };
      }
    }
    return licenseTypes[0];
  };
  
  // Media type categories with weights
  const categories = [
    { type: 'audio' as const, category: 'music', weight: 30 },
    { type: 'image' as const, category: 'art', weight: 35 },
    { type: 'video' as const, category: 'video', weight: 20 },
    { type: 'text' as const, category: 'character', weight: 10 },
    { type: 'other' as const, category: 'game', weight: 5 },
  ];
  
  const getRandomCategory = () => {
    const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;
    for (const cat of categories) {
      random -= cat.weight;
      if (random <= 0) return cat;
    }
    return categories[0];
  };
  
  // Generate base/root IPs (20% of total)
  const baseCount = Math.floor(totalAssets * 0.2);
  const now = Date.now() / 1000;
  const oneYearAgo = now - (365 * 86400);
  
  console.log(`Generating ${totalAssets} mock IP assets (${baseCount} roots, ${totalAssets - baseCount} derivatives)...`);
  
  for (let i = 0; i < baseCount; i++) {
    const ipId = randomIpId();
    const license = getRandomLicense();
    const cat = getRandomCategory();
    const name = generateName(cat.category, false);
    
    // Power law revenue distribution (few high earners)
    const revenueBase = Math.pow(Math.random(), 3) * 100000;
    
    mockAssets.push({
      id: `${i}`,
      ipId,
      tokenContract: randomAddress(),
      tokenId: `${1000 + i}`,
      chainId: 1513,
      owner: randomAddress(),
      blockNumber: 5000000 + i * 100,
      blockTimestamp: oneYearAgo + (Math.random() * 250 * 86400),
      metadata: {
        name,
        description: generateDescription(cat.category, name, false),
        mediaType: cat.type,
        imageUrl: `https://picsum.photos/seed/${ipId.slice(2, 10)}/400/400`,
      },
      licenseTerms: [license as any],
      parents: [],
      children: [],
      totalRevenue: revenueBase.toFixed(2),
    });
  }
  
  // Identify popular IPs (will have many derivatives)
  const popularIndices = new Set<number>();
  const popularCount = Math.floor(baseCount * 0.15);
  while (popularIndices.size < popularCount) {
    popularIndices.add(Math.floor(Math.random() * baseCount));
  }
  
  // Generate derivative IPs with realistic parent relationships
  for (let i = baseCount; i < totalAssets; i++) {
    const ipId = randomIpId();
    const license = getRandomLicense();
    
    // 70% derive from popular IPs, 30% from random
    let parentIndex: number;
    if (Math.random() < 0.7 && popularIndices.size > 0) {
      const popularArray = Array.from(popularIndices);
      parentIndex = popularArray[Math.floor(Math.random() * popularArray.length)];
    } else {
      parentIndex = Math.floor(Math.random() * mockAssets.length);
    }
    
    // 85% single parent, 15% multi-parent
    const numParents = Math.random() < 0.85 ? 1 : Math.min(3, Math.floor(Math.random() * 2) + 2);
    const parentIndices = new Set<number>([parentIndex]);
    
    while (parentIndices.size < numParents && mockAssets.length > 3) {
      const candidateIndex = Math.floor(Math.random() * mockAssets.length);
      if (!parentIndices.has(candidateIndex)) {
        parentIndices.add(candidateIndex);
      }
    }
    
    const parents = Array.from(parentIndices).map(idx => mockAssets[idx].ipId);
    const primaryParent = mockAssets[parentIndex];
    const name = generateName(
      primaryParent.metadata?.mediaType || 'art',
      true,
      primaryParent.metadata?.name
    );
    
    // Derivatives earn less revenue on average
    const revenueBase = Math.pow(Math.random(), 4) * 50000;
    
    // Timestamp: derivatives created after parents
    const parentTimestamp = primaryParent.blockTimestamp;
    const timeSinceParent = Math.random() * 150 * 86400; // 0-150 days
    
    mockAssets.push({
      id: `${i}`,
      ipId,
      tokenContract: Math.random() > 0.5 ? primaryParent.tokenContract : randomAddress(),
      tokenId: `${1000 + i}`,
      chainId: 1513,
      owner: randomAddress(),
      blockNumber: 5000000 + i * 100,
      blockTimestamp: Math.min(parentTimestamp + timeSinceParent, now),
      metadata: {
        name,
        description: generateDescription(
          primaryParent.metadata?.mediaType || 'art',
          primaryParent.metadata?.name || 'Unknown',
          true
        ),
        mediaType: primaryParent.metadata?.mediaType || 'image',
        imageUrl: `https://picsum.photos/seed/${ipId.slice(2, 10)}/400/400`,
      },
      licenseTerms: [license as any],
      parents,
      children: [],
      totalRevenue: revenueBase.toFixed(2),
    });
    
    // Update parent children arrays
    parents.forEach(parentId => {
      const parent = mockAssets.find(a => a.ipId === parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        if (!parent.children.includes(ipId)) {
          parent.children.push(ipId);
        }
      }
    });
  }
  
  console.log(`✅ Generated ${mockAssets.length} mock IP assets`);
  console.log(`   - ${baseCount} root IPs`);
  console.log(`   - ${mockAssets.length - baseCount} derivative IPs`);
  console.log(`   - ${popularIndices.size} viral/popular IPs`);
  
  cachedMockAssets = mockAssets;
  return mockAssets;
}
