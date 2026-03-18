'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode } from '@/lib/story-protocol/types';
import { useGraphStore } from '@/stores/graphStore';
import { getNodeColor, getNodeSize } from '@/lib/graph/graph-builder';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full"><div className="text-zinc-400">Loading graph...</div></div>,
});

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
}

export default function ForceGraph({ data, width = 800, height = 600 }: ForceGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  // Use refs for store values so callbacks don't change identity on every render
  const selectedNodeRef = useRef<GraphNode | null>(null);
  const highlightedNodesRef = useRef<Set<string>>(new Set());

  const { selectedNode, setSelectedNode, setHoveredNode, highlightedNodes } = useGraphStore();

  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);
  useEffect(() => { highlightedNodesRef.current = highlightedNodes; }, [highlightedNodes]);

  // Stable graph data ref — never changes identity so simulation never resets
  const graphDataRef = useRef({ nodes: data.nodes, links: data.edges });
  useEffect(() => {
    graphDataRef.current.nodes = data.nodes;
    graphDataRef.current.links = data.edges;
    // Notify force graph of new data without replacing the object
    fgRef.current?.d3ReheatSimulation?.();
  }, [data.nodes, data.edges]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    const ids = new Set<string>([node.id]);
    data.edges.forEach(edge => {
      const src = typeof edge.source === 'string' ? edge.source : (edge.source as GraphNode).id;
      const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as GraphNode).id;
      if (src === node.id) ids.add(tgt);
      if (tgt === node.id) ids.add(src);
    });
    useGraphStore.setState({ highlightedNodes: ids });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    useGraphStore.setState({ highlightedNodes: new Set() });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const nodeSize = getNodeSize(node);
    const isHighlighted = highlightedNodesRef.current.has(node.id);
    const isSelected = selectedNodeRef.current?.id === node.id;
    const x = node.x ?? 0;
    const y = node.y ?? 0;

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();

    if (isSelected || isHighlighted) {
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = (isSelected ? 3 : 1.5) / globalScale;
      ctx.stroke();
    }

    // Label — fixed 12px regardless of zoom, only show when zoomed in
    if (globalScale > 0.8) {
      const LABEL_SIZE = 12;
      ctx.font = `${LABEL_SIZE / globalScale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const label = node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name;
      ctx.fillText(label, x, y + nodeSize + 2 / globalScale);
    }
  }, []);

  const linkCanvasObject = useCallback((link: { source: string | GraphNode; target: string | GraphNode }, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
    const isHighlighted = highlightedNodesRef.current.has(sourceId) && highlightedNodesRef.current.has(targetId);

    const sourceNode = typeof link.source === 'string' ? null : link.source as GraphNode;
    const targetNode = typeof link.target === 'string' ? null : link.target as GraphNode;
    if (!sourceNode || !targetNode) return;

    const sx = sourceNode.x ?? 0, sy = sourceNode.y ?? 0;
    const tx = targetNode.x ?? 0, ty = targetNode.y ?? 0;

    ctx.strokeStyle = isHighlighted ? 'rgba(255,255,255,0.8)' : 'rgba(156,163,175,0.25)';
    ctx.lineWidth = (isHighlighted ? 2 : 1) / globalScale;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    if (globalScale > 0.7) {
      const arrowLen = 8 / globalScale;
      const angle = Math.atan2(ty - sy, tx - sx);
      const ax = tx - Math.cos(angle) * (getNodeSize(targetNode) + 2);
      const ay = ty - Math.sin(angle) * (getNodeSize(targetNode) + 2);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - arrowLen * Math.cos(angle - Math.PI / 6), ay - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ax - arrowLen * Math.cos(angle + Math.PI / 6), ay - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
      {data.nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-400">No IP assets to display</p>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphDataRef.current}
          width={width}
          height={height}
          backgroundColor="#09090b"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodeCanvasObject={nodeCanvasObject as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          linkCanvasObject={linkCanvasObject as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onNodeClick={handleNodeClick as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onNodeHover={handleNodeHover as any}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      )}
    </div>
  );
}
