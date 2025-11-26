'use client';

import { useGraphData } from '@/lib/hooks/useGraphData';
import { useGraphStore } from '@/stores/graphStore';
import { useFilterStore } from '@/stores/filterStore';
import { useIPAssets } from '@/lib/hooks/useIPAssets';
import ForceGraph from '@/components/graph/ForceGraph';
import NodeDetails from '@/components/graph/NodeDetails';
import GraphControls from '@/components/graph/GraphControls';
import LegendPanel from '@/components/graph/LegendPanel';
import GraphStats from '@/components/graph/GraphStats';
import GenealogyTree from '@/components/graph/GenealogyTree';
import TimeTravelSlider from '@/components/graph/TimeTravelSlider';
import NetworkInsights from '@/components/graph/NetworkInsights';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import ActiveFilters from '@/components/search/ActiveFilters';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, BarChart3, GitBranch, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { buildIPTree } from '@/lib/graph/tree-builder';

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const filters = useFilterStore();
  const { assets } = useIPAssets({ limit: 1000 });
  const { graphData, metrics, isLoading, isError } = useGraphData(filters);
  const { selectedNode } = useGraphStore();
  
  // Phase 5A: Advanced Features State
  const [showGenealogyTree, setShowGenealogyTree] = useState(false);
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [selectedTreeIp, setSelectedTreeIp] = useState<string | null>(null);
  
  // Date range for time travel
  const dateRange = useMemo(() => {
    if (assets.length === 0) return { min: Date.now() / 1000, max: Date.now() / 1000 };
    const timestamps = assets.map(a => a.blockTimestamp);
    return {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps),
    };
  }, [assets]);
  
  const [currentDate, setCurrentDate] = useState(dateRange.max);

  // Update dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 100,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Update current date when date range changes
  useEffect(() => {
    setCurrentDate(dateRange.max);
  }, [dateRange.max]);
  
  // Filter graph data by time travel date
  const filteredByDate = useMemo(() => {
    if (!showTimeTravel) return graphData;
    
    const filteredNodes = graphData.nodes.filter(node => node.timestamp <= currentDate);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(
      edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, currentDate, showTimeTravel]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Story Atlas
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Interactive IP Relationship Explorer
              </p>
            </div>
            <div className="flex items-center gap-6">
              {!isLoading && (
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-zinc-500">IPs: </span>
                    <span className="font-semibold">{metrics.totalNodes}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Connections: </span>
                    <span className="font-semibold">{metrics.totalEdges}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Isolated: </span>
                    <span className="font-semibold">{metrics.isolatedNodes}</span>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimeTravel(!showTimeTravel)}
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                {showTimeTravel ? 'Hide' : 'Time Travel'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedNode) {
                    setSelectedTreeIp(selectedNode.ipId);
                    setShowGenealogyTree(true);
                  }
                }}
                disabled={!selectedNode}
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white disabled:opacity-50"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Genealogy
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <Link href="/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3">
            <SearchBar 
              onSelectIP={(ipId) => {
                // Find and select the node in the graph
                const node = graphData.nodes.find(n => n.ipId === ipId);
                if (node) {
                  useGraphStore.setState({ selectedNode: node });
                }
              }}
            />
            <FilterPanel />
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters />
      </header>

      {/* Main Content */}
      <main className="relative">
        {isLoading ? (
          <motion.div 
            className="flex items-center justify-center h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              </motion.div>
              <motion.p 
                className="text-zinc-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Loading IP assets from Story Protocol...
              </motion.p>
            </div>
          </motion.div>
        ) : isError ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center max-w-md">
              <p className="text-red-400 text-lg mb-2">Failed to load data</p>
              <p className="text-zinc-500 text-sm">
                Please check your connection or try again later
              </p>
            </div>
          </div>
        ) : (
          <motion.div 
            className="relative"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <ForceGraph 
              data={filteredByDate} 
              width={dimensions.width}
              height={dimensions.height}
            />
            <NetworkInsights graphData={filteredByDate} />
            <LegendPanel />
            <GraphStats metrics={metrics} />
            <GraphControls graphData={graphData} />
            {selectedNode && <NodeDetails node={selectedNode} />}
            
            {/* Phase 5A: Time Travel Slider */}
            {showTimeTravel && (
              <TimeTravelSlider
                minDate={dateRange.min}
                maxDate={dateRange.max}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            )}
            
            {/* Phase 5A: Genealogy Tree Modal */}
            {showGenealogyTree && selectedTreeIp && (
              <GenealogyTree
                tree={buildIPTree(selectedTreeIp, assets) || { 
                  id: '', name: '', ipId: '', depth: 0, derivativeCount: 0, 
                  licenseType: '', timestamp: 0 
                }}
                onClose={() => setShowGenealogyTree(false)}
              />
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
