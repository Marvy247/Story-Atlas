'use client';

import React, { useState } from 'react';
import { TrendingUp, Network, GitBranch, Zap, ChevronDown } from 'lucide-react';

interface GraphStatsProps {
  metrics: {
    totalNodes: number;
    totalEdges: number;
    avgDegree: number;
    isolatedNodes: number;
  };
}

export default function GraphStats({ metrics }: GraphStatsProps) {
  const [open, setOpen] = useState(false);

  const stats = [
    { icon: Network, label: 'IPs', value: metrics.totalNodes, color: 'text-blue-400' },
    { icon: GitBranch, label: 'Connections', value: metrics.totalEdges, color: 'text-purple-400' },
    { icon: TrendingUp, label: 'Avg Degree', value: metrics.avgDegree.toFixed(1), color: 'text-green-400' },
    ...(metrics.isolatedNodes > 0 ? [{ icon: Zap, label: 'Isolated', value: metrics.isolatedNodes, color: 'text-amber-400' }] : []),
  ];

  return (
    <div className="absolute bottom-20 right-4 z-10 w-44 sm:w-52">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-2 bg-zinc-900/95 border border-zinc-700 rounded-lg text-sm font-semibold text-zinc-200 backdrop-blur-sm hover:bg-zinc-800 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Network className="h-3.5 w-3.5 text-blue-400" />
          {metrics.totalNodes.toLocaleString()} IPs
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="mt-1 bg-zinc-900/95 border border-zinc-700 rounded-lg p-3 backdrop-blur-sm space-y-2">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                <span className="text-xs text-zinc-400">{s.label}</span>
              </div>
              <span className={`text-sm font-bold ${s.color}`}>{s.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
