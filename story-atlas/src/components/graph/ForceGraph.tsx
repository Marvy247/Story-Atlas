'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fgRef?: React.RefObject<any>;
}

// Cache for loaded node images
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url)!);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageCache.set(url, img); resolve(img); };
    img.onerror = () => resolve(img); // resolve anyway, draw fallback
    img.src = url;
  });
}

export default function ForceGraph({ data, width = 800, height = 600, fgRef: externalRef }: ForceGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [showZoomHint, setShowZoomHint] = useState(true);

  // Auto-dismiss zoom hint after 4s
  useEffect(() => {
    const t = setTimeout(() => setShowZoomHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Keep external ref in sync every render
  useEffect(() => {
    if (externalRef && fgRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (externalRef as React.MutableRefObject<any>).current = fgRef.current;
    }
  });

  // Track mouse position for tooltip placement
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  const selectedNodeRef = useRef<GraphNode | null>(null);
  const highlightedNodesRef = useRef<Set<string>>(new Set());
  const { selectedNode, setSelectedNode, setHoveredNode, highlightedNodes } = useGraphStore();

  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);
  useEffect(() => { highlightedNodesRef.current = highlightedNodes; }, [highlightedNodes]);

  const graphDataRef = useRef({ nodes: data.nodes, links: data.edges });
  const dataRef = useRef(data);
  const setSelectedNodeRef = useRef(setSelectedNode);

  const prevNodeCountRef = useRef(0);
  const initialZoomDone = useRef(false);

  useEffect(() => {
    graphDataRef.current.nodes = data.nodes;
    graphDataRef.current.links = data.edges;
    dataRef.current = data;
    setSelectedNodeRef.current = setSelectedNode;
    if (data.nodes.length !== prevNodeCountRef.current) {
      prevNodeCountRef.current = data.nodes.length;
      fgRef.current?.d3ReheatSimulation?.();
      // Zoom to fit + center on first load
      if (!initialZoomDone.current && data.nodes.length > 0) {
        initialZoomDone.current = true;
        setTimeout(() => {
          fgRef.current?.zoomToFit(400, 80); // fit all nodes with 80px padding
          setTimeout(() => fgRef.current?.zoom(3, 600), 500); // then zoom in
        }, 1200);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nodes, data.edges, setSelectedNode]);

  // Preload images for visible nodes
  useEffect(() => {
    data.nodes.forEach(node => {
      const url = (node as GraphNode & { imageUrl?: string }).imageUrl;
      if (url) loadImage(url);
    });
  }, [data.nodes]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeRef.current(node);
    const ids = new Set<string>([node.id]);
    dataRef.current.edges.forEach(edge => {
      const src = typeof edge.source === 'string' ? edge.source : (edge.source as GraphNode).id;
      const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as GraphNode).id;
      if (src === node.id) ids.add(tgt);
      if (tgt === node.id) ids.add(src);
    });
    useGraphStore.setState({ highlightedNodes: ids });
    setTooltip(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
    if (node) {
      setTooltip({ x: mousePos.current.x, y: mousePos.current.y, node });
    } else {
      setTooltip(null);
    }
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
    const color = getNodeColor(node);
    const imageUrl = (node as GraphNode & { imageUrl?: string }).imageUrl;

    // Glow for selected
    if (isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15 / globalScale;
    }

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw image thumbnail inside circle
    const img = imageUrl ? imageCache.get(imageUrl) : null;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, nodeSize - 0.5, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, x - nodeSize, y - nodeSize, nodeSize * 2, nodeSize * 2);
      ctx.restore();
    }

    // Border
    if (isSelected || isHighlighted) {
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = (isSelected ? 2.5 : 1.5) / globalScale;
      ctx.beginPath();
      ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Label — scales with zoom
    ctx.font = `5px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const label = node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name;
    ctx.fillText(label, x, y + nodeSize + 1);
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
    <div
      className="relative w-full h-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800"
      style={{ cursor: tooltip ? 'pointer' : 'default' }}
      onMouseMove={(e) => {
        if (tooltip) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
      }}
      onWheel={() => setShowZoomHint(false)}
      onTouchStart={() => setShowZoomHint(false)}
    >
      {data.nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-400">No IP assets to display</p>
        </div>
      ) : (
        <>
          <ForceGraph2D
            ref={fgRef}
            graphData={graphDataRef.current}
            width={width}
            height={height}
            backgroundColor="#09090b"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodeCanvasObject={nodeCanvasObject as any}
            // Tell the library the hit area for hover/click detection
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, getNodeSize(node as GraphNode) + 2, 0, 2 * Math.PI);
              ctx.fill();
            }}
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

          {/* Hover Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-sm"
              style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
            >
              <p className="font-semibold text-white">{tooltip.node.name}</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                {tooltip.node.licenseType} · {tooltip.node.derivativeCount} derivatives
              </p>
              <p className="text-zinc-500 text-xs">{tooltip.node.owner.slice(0, 6)}…{tooltip.node.owner.slice(-4)}</p>
            </div>
          )}

          {/* Zoom hint — top-center, fades after 4s or first scroll/pinch */}
          {showZoomHint && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-700 rounded-full text-xs text-zinc-400 backdrop-blur-sm whitespace-nowrap animate-pulse">
                <span>🔍</span>
                Scroll or pinch to zoom
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
