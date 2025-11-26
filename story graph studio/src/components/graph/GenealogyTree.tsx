'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as d3 from 'd3';
import { TreeNode } from '@/lib/graph/tree-builder';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInRight } from '@/lib/animations';

interface GenealogyTreeProps {
  tree: TreeNode;
  onClose: () => void;
}

export default function GenealogyTree({ tree, onClose }: GenealogyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !tree) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    // Convert to hierarchy
    const root = d3.hierarchy(tree);
    const treeData = treeLayout(root);

    // Color mapping
    const colorMap: { [key: string]: string } = {
      'Commercial Remix': '#10b981',
      'Commercial': '#3b82f6',
      'Non-Commercial Remix': '#f59e0b',
      'Attribution Only': '#8b5cf6',
      'None': '#6b7280',
    };

    // Draw links
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 2)
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Node circles
    nodes.append('circle')
      .attr('r', 8)
      .attr('fill', d => colorMap[d.data.licenseType] || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.name)
      .style('fill', '#fff')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Derivative count badges
    nodes.filter(d => d.data.derivativeCount > 0)
      .append('circle')
      .attr('cx', 12)
      .attr('cy', -12)
      .attr('r', 10)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    nodes.filter(d => d.data.derivativeCount > 0)
      .append('text')
      .attr('x', 12)
      .attr('y', -12)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.derivativeCount)
      .style('fill', '#fff')
      .style('font-size', '10px')
      .style('font-weight', 'bold');

  }, [tree]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleFitView = () => {
    setZoom(1);
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={slideInRight}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <Card 
          className="w-full max-w-5xl h-[80vh] bg-zinc-900 border-zinc-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-white">IP Genealogy Tree</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Explore the complete derivative chain
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-zinc-400 hover:text-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-zinc-400 hover:text-white"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFitView}
                className="text-zinc-400 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tree Canvas */}
          <div className="relative w-full h-full overflow-auto p-4">
            <div 
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
              className="flex items-center justify-center"
            >
              <svg ref={svgRef} className="bg-zinc-950 rounded-lg" />
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-zinc-400 mb-2">License Types</p>
            <div className="space-y-1">
              {[
                { name: 'Commercial Remix', color: '#10b981' },
                { name: 'Commercial', color: '#3b82f6' },
                { name: 'Non-Commercial', color: '#f59e0b' },
              ].map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-xs text-zinc-300">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
