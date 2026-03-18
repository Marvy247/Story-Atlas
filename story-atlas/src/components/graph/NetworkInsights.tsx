'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Award, Network, GitBranch, ChevronDown } from 'lucide-react';
import { GraphData } from '@/lib/story-protocol/types';
import { motion } from 'framer-motion';
import { fadeInDown } from '@/lib/animations';

interface NetworkInsightsProps {
  graphData: GraphData;
}

interface Insight {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  description: string;
}

export default function NetworkInsights({ graphData }: NetworkInsightsProps) {
  const [open, setOpen] = useState(false);
  const insights = useMemo(() => {
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    if (nodes.length === 0) {
      return [];
    }

    // Calculate network density
    const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
    const density = maxPossibleEdges > 0 ? (edges.length / maxPossibleEdges) * 100 : 0;

    // Find most influential IP (highest degree centrality)
    const degreeMap = new Map<string, number>();
    edges.forEach(edge => {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    });

    const mostInfluential = nodes.reduce((max, node) => {
      const degree = degreeMap.get(node.id) || 0;
      const maxDegree = degreeMap.get(max.id) || 0;
      return degree > maxDegree ? node : max;
    }, nodes[0]);

    // Calculate average derivative depth
    function calculateDepth(nodeId: string, visited: Set<string> = new Set()): number {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const children = edges
        .filter(e => e.source === nodeId)
        .map(e => e.target);

      if (children.length === 0) return 1;

      return 1 + Math.max(...children.map(c => calculateDepth(c, new Set(visited))));
    }

    const rootNodes = nodes.filter(n => n.parentCount === 0);
    const avgDepth = rootNodes.length > 0
      ? rootNodes.reduce((sum, n) => sum + calculateDepth(n.id), 0) / rootNodes.length
      : 0;

    // Find largest derivative chain
    const maxDepth = rootNodes.length > 0
      ? Math.max(...rootNodes.map(n => calculateDepth(n.id)))
      : 0;

    const insightsData: Insight[] = [
      {
        icon: Network,
        label: 'Network Density',
        value: `${density.toFixed(1)}%`,
        color: 'text-blue-400',
        description: 'How connected the IPs are',
      },
      {
        icon: Award,
        label: 'Most Influential',
        value: mostInfluential.name.slice(0, 15) + (mostInfluential.name.length > 15 ? '...' : ''),
        color: 'text-yellow-400',
        description: `${degreeMap.get(mostInfluential.id) || 0} connections`,
      },
      {
        icon: GitBranch,
        label: 'Longest Chain',
        value: maxDepth,
        color: 'text-purple-400',
        description: 'Deepest derivative lineage',
      },
      {
        icon: TrendingUp,
        label: 'Avg Depth',
        value: avgDepth.toFixed(1),
        color: 'text-green-400',
        description: 'Average derivative levels',
      },
    ];

    return insightsData;
  }, [graphData]);

  if (insights.length === 0) return null;

  return (
    <motion.div
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-max max-w-[calc(100vw-8rem)]"
    >
      {/* Toggle pill */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mx-auto px-4 py-1.5 bg-zinc-900/95 border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300 backdrop-blur-sm hover:bg-zinc-800 transition-colors"
      >
        <Network className="h-3.5 w-3.5 text-blue-400" />
        Insights
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible row */}
      {open && (
        <Card className="mt-1 bg-zinc-900/95 backdrop-blur-sm border-zinc-700 p-2">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg"
              >
                <insight.icon className={`h-4 w-4 ${insight.color} shrink-0`} />
                <div>
                  <p className="text-xs text-zinc-500">{insight.label}</p>
                  <p className={`text-sm font-bold ${insight.color}`}>{insight.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
