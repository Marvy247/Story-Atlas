'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode, GraphEdge } from '@/lib/story-protocol/types';
import { useGraphStore } from '@/stores/graphStore';
import { getNodeColor, getNodeSize } from '@/lib/graph/graph-builder';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-zinc-400">Loading graph...</div>
    </div>
  ),
});

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
}

export default function ForceGraph({ data, width = 800, height = 600 }: ForceGraphProps) {
  const fgRef = useRef<any>(null);
  const { selectedNode, setSelectedNode, hoveredNode, setHoveredNode, highlightedNodes } = useGraphStore();
  const [graphData, setGraphData] = useState<any>({
    nodes: data.nodes,
    links: data.edges,
  });

  useEffect(() => {
    // Transform edges to links for react-force-graph
    setGraphData({
      nodes: data.nodes,
      links: data.edges,
    });
  }, [data]);

  // Handle node click
  const handleNodeClick = (node: any) => {
    setSelectedNode(node as GraphNode);
    
    // Highlight connected nodes
    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(node.id);
    
    // Add parent and child nodes
    data.edges.forEach(edge => {
      if (edge.source === node.id) {
        connectedNodeIds.add(typeof edge.target === 'string' ? edge.target : (edge.target as any).id);
      }
      if (edge.target === node.id) {
        connectedNodeIds.add(typeof edge.source === 'string' ? edge.source : (edge.source as any).id);
      }
    });
    
    useGraphStore.setState({ highlightedNodes: connectedNodeIds });
  };

  // Handle node hover
  const handleNodeHover = (node: any) => {
    setHoveredNode(node as GraphNode | null);
  };

  // Node canvas rendering
  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeSize = getNodeSize(node);
    const isHighlighted = highlightedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();

    // Add border for selected/highlighted nodes
    if (isSelected || isHighlighted) {
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = (isSelected ? 3 : 2) / globalScale;
      ctx.stroke();
    }

    // Draw label
    if (globalScale > 0.5) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
    }
  };

  // Link rendering
  const linkCanvasObject = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    const isHighlighted = highlightedNodes.has(sourceId) && highlightedNodes.has(targetId);

    // Determine link style
    ctx.strokeStyle = isHighlighted ? 'rgba(255, 255, 255, 0.8)' : 'rgba(156, 163, 175, 0.3)';
    ctx.lineWidth = (isHighlighted ? 2 : 1) / globalScale;

    // Draw link
    const sourceNode = typeof link.source === 'string' ? null : link.source;
    const targetNode = typeof link.target === 'string' ? null : link.target;

    if (sourceNode && targetNode) {
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.stroke();

      // Draw arrow
      if (globalScale > 0.7) {
        const arrowLength = 10 / globalScale;
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
        const arrowX = targetNode.x - Math.cos(angle) * (getNodeSize(targetNode) + 2);
        const arrowY = targetNode.y - Math.sin(angle) * (getNodeSize(targetNode) + 2);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
      {data.nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-zinc-400 text-lg mb-2">No IP assets to display</p>
            <p className="text-zinc-600 text-sm">Try adjusting your filters or check your connection</p>
          </div>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={width}
          height={height}
          backgroundColor="#09090b"
          nodeCanvasObject={nodeCanvasObject}
          linkCanvasObject={linkCanvasObject}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={() => {
            setSelectedNode(null);
            useGraphStore.setState({ highlightedNodes: new Set() });
          }}
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
