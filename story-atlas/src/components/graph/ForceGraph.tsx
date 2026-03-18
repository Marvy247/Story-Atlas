'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode } from '@/lib/story-protocol/types';
import { useGraphStore } from '@/stores/graphStore';
import { getNodeColor, getNodeSize } from '@/lib/graph/graph-builder';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => null,
});

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fgRef?: React.RefObject<any>;
}

// Module-level image cache — persists across renders
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(url: string): void {
  if (imageCache.has(url)) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => imageCache.set(url, img);
  img.onerror = () => imageCache.set(url, img); // cache even on error to avoid retries
  img.src = url;
}

// Pre-compute gradient — keyed by color only (position baked in, acceptable for moving nodes)
function getNodeGradient(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): CanvasGradient {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, lighten(color, 0.35));
  grad.addColorStop(1, color);
  return grad;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}

export default function ForceGraph({ data, width = 800, height = 600, fgRef: externalRef }: ForceGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [showZoomHint, setShowZoomHint] = useState(true);

  // Passive wheel/touch listeners to avoid scroll-blocking violation
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const dismiss = () => setShowZoomHint(false);
    el.addEventListener('wheel', dismiss, { passive: true });
    el.addEventListener('touchstart', dismiss, { passive: true });
    return () => {
      el.removeEventListener('wheel', dismiss);
      el.removeEventListener('touchstart', dismiss);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowZoomHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (externalRef && fgRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (externalRef as React.MutableRefObject<any>).current = fgRef.current;
    }
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  const selectedNodeRef = useRef<GraphNode | null>(null);
  const highlightedNodesRef = useRef<Set<string>>(new Set());
  const hasHighlightRef = useRef(false);
  const { selectedNode, setSelectedNode, setHoveredNode, highlightedNodes } = useGraphStore();

  useEffect(() => { selectedNodeRef.current = selectedNode; }, [selectedNode]);
  useEffect(() => {
    highlightedNodesRef.current = highlightedNodes;
    hasHighlightRef.current = highlightedNodes.size > 0;
  }, [highlightedNodes]);

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

      if (!initialZoomDone.current && data.nodes.length > 0) {
        initialZoomDone.current = true;
        setTimeout(() => {
          fgRef.current?.zoomToFit(400, 80);
          setTimeout(() => fgRef.current?.zoom(3, 600), 500);
        }, 1200);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nodes, data.edges, setSelectedNode]);

  // Preload images — only for new nodes, throttled
  const preloadedRef = useRef(new Set<string>());
  useEffect(() => {
    let i = 0;
    const batch = () => {
      const slice = data.nodes.slice(i, i + 20);
      slice.forEach(node => {
        const url = (node as GraphNode & { imageUrl?: string }).imageUrl;
        if (url && !preloadedRef.current.has(url)) {
          preloadedRef.current.add(url);
          loadImage(url);
        }
      });
      i += 20;
      if (i < data.nodes.length) requestIdleCallback ? requestIdleCallback(batch) : setTimeout(batch, 50);
    };
    batch();
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
    const highlighted = highlightedNodesRef.current;
    const hasHighlight = hasHighlightRef.current;
    const isHighlighted = highlighted.has(node.id);
    const isSelected = selectedNodeRef.current?.id === node.id;
    const isDimmed = hasHighlight && !isHighlighted;
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const color = getNodeColor(node);
    const imageUrl = (node as GraphNode & { imageUrl?: string }).imageUrl;

    ctx.globalAlpha = isDimmed ? 0.15 : 1;

    // Outer glow ring for selected — only when zoomed in enough to see it
    if (isSelected && globalScale > 0.8) {
      ctx.beginPath();
      ctx.arc(x, y, nodeSize + 5, 0, 2 * Math.PI);
      ctx.fillStyle = color + '33';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, nodeSize + 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = color + '66';
      ctx.fill();
    }

    // Node circle — flat fill when zoomed out (gradient invisible + expensive), gradient when zoomed in
    ctx.beginPath();
    ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = globalScale > 1.5 ? getNodeGradient(ctx, x, y, nodeSize, color) : color;
    ctx.fill();

    // NFT thumbnail
    const img = imageUrl ? imageCache.get(imageUrl) : null;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, nodeSize - 1, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, x - nodeSize, y - nodeSize, nodeSize * 2, nodeSize * 2);
      // Subtle color overlay so license color is still visible
      ctx.fillStyle = color + '44';
      ctx.fill();
      ctx.restore();
    }

    // Highlight ring
    if (isSelected || isHighlighted) {
      ctx.strokeStyle = isSelected ? '#ffffff' : color;
      ctx.lineWidth = (isSelected ? 2.5 : 1.5) / globalScale;
      ctx.beginPath();
      ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Label — only show when zoomed in enough
    if (globalScale > 1.2) {
      const fontSize = Math.max(3, 5 / globalScale * globalScale); // stable size
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Label background pill for readability
      const label = node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name;
      const textW = ctx.measureText(label).width;
      const pad = 1.5;
      ctx.fillStyle = 'rgba(9,9,11,0.75)';
      ctx.beginPath();
      ctx.roundRect(x - textW / 2 - pad, y + nodeSize + 1, textW + pad * 2, fontSize + pad * 2, 1);
      ctx.fill();
      ctx.fillStyle = isHighlighted || isSelected ? '#ffffff' : 'rgba(255,255,255,0.8)';
      ctx.fillText(label, x, y + nodeSize + 1 + pad);
    }

    ctx.globalAlpha = 1;
  }, []);

  const linkCanvasObject = useCallback((link: { source: string | GraphNode; target: string | GraphNode }, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const sourceNode = typeof link.source === 'string' ? null : link.source as GraphNode;
    const targetNode = typeof link.target === 'string' ? null : link.target as GraphNode;
    if (!sourceNode || !targetNode) return;

    const sourceId = sourceNode.id;
    const targetId = targetNode.id;
    const highlighted = highlightedNodesRef.current;
    const hasHighlight = hasHighlightRef.current;
    const isHighlighted = highlighted.has(sourceId) && highlighted.has(targetId);
    const isDimmed = hasHighlight && !isHighlighted;

    const sx = sourceNode.x ?? 0, sy = sourceNode.y ?? 0;
    const tx = targetNode.x ?? 0, ty = targetNode.y ?? 0;

    ctx.globalAlpha = isDimmed ? 0.05 : isHighlighted ? 1 : 0.3;

    if (isHighlighted) {
      // Gradient edge from source color to target color
      const grad = ctx.createLinearGradient(sx, sy, tx, ty);
      grad.addColorStop(0, getNodeColor(sourceNode));
      grad.addColorStop(1, getNodeColor(targetNode));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2 / globalScale;
    } else {
      ctx.strokeStyle = 'rgba(156,163,175,0.4)';
      ctx.lineWidth = 0.8 / globalScale;
    }

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Arrow — only when zoomed in or highlighted
    if (isHighlighted || globalScale > 1) {
      const arrowLen = (isHighlighted ? 10 : 7) / globalScale;
      const angle = Math.atan2(ty - sy, tx - sx);
      const ax = tx - Math.cos(angle) * (getNodeSize(targetNode) + 1);
      const ay = ty - Math.sin(angle) * (getNodeSize(targetNode) + 1);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - arrowLen * Math.cos(angle - Math.PI / 6), ay - arrowLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ax - arrowLen * Math.cos(angle + Math.PI / 6), ay - arrowLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = isHighlighted ? getNodeColor(targetNode) : 'rgba(156,163,175,0.4)';
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-zinc-950 overflow-hidden"
      style={{ cursor: tooltip ? 'pointer' : 'default' }}
      onMouseMove={(e) => {
        if (tooltip) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
      }}
    >
      {data.nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-500 text-sm">No IP assets to display</p>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, getNodeSize(node as GraphNode) + 4, 0, 2 * Math.PI);
              ctx.fill();
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            linkCanvasObject={linkCanvasObject as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onNodeClick={handleNodeClick as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onNodeHover={handleNodeHover as any}
            onBackgroundClick={handleBackgroundClick}
            cooldownTicks={80}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.4}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{ left: tooltip.x + 14, top: tooltip.y - 48 }}
            >
              <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm">
                <p className="font-semibold text-white text-sm leading-tight">{tooltip.node.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getNodeColor(tooltip.node) }} />
                  <p className="text-zinc-400 text-xs">{tooltip.node.licenseType}</p>
                </div>
                <p className="text-zinc-500 text-xs mt-0.5">{tooltip.node.derivativeCount} derivatives · {tooltip.node.owner.slice(0, 6)}…{tooltip.node.owner.slice(-4)}</p>
              </div>
            </div>
          )}

          {/* Zoom hint */}
          {showZoomHint && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-700 rounded-full text-xs text-zinc-400 backdrop-blur-sm whitespace-nowrap animate-pulse">
                <span>🔍</span> Scroll or pinch to zoom
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
