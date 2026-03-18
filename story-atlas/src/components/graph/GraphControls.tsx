'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { exportGraphAsJSON } from '@/lib/graph/graph-builder';
import { GraphData } from '@/lib/story-protocol/types';

interface GraphControlsProps {
  graphData: GraphData;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
}

export default function GraphControls({
  graphData,
  onZoomIn,
  onZoomOut,
  onFitView,
}: GraphControlsProps) {
  const handleExport = () => {
    const json = exportGraphAsJSON(graphData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-graph-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute bottom-6 left-6 flex gap-2 z-10">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onFitView}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          title="Fit View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
        title="Export Graph Data"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline ml-1.5">Export JSON</span>
      </Button>
    </div>
  );
}
