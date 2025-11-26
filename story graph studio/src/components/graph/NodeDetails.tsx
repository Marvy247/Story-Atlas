'use client';

import React from 'react';
import { GraphNode } from '@/lib/story-protocol/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { useGraphStore } from '@/stores/graphStore';
import { EXPLORER_URL } from '@/lib/story-protocol/client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInRight } from '@/lib/animations';

interface NodeDetailsProps {
  node: GraphNode;
}

export default function NodeDetails({ node }: NodeDetailsProps) {
  const { setSelectedNode } = useGraphStore();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(node.ipId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={slideInRight}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed right-6 top-6 w-96 max-h-[80vh] overflow-y-auto z-50"
      >
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{node.name}</h2>
            <p className="text-sm text-zinc-400">{node.mediaType || 'Unknown type'}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedNode(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* IP ID */}
        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">
            IP Asset ID
          </label>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-zinc-800 px-3 py-1.5 rounded flex-1 overflow-hidden text-ellipsis">
              {formatAddress(node.ipId)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="text-zinc-400 hover:text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-zinc-400 hover:text-white"
            >
              <a
                href={`${EXPLORER_URL}/assets/${node.ipId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800 p-3 rounded">
            <p className="text-xs text-zinc-500 mb-1">Derivatives</p>
            <p className="text-2xl font-bold">{node.derivativeCount}</p>
          </div>
          <div className="bg-zinc-800 p-3 rounded">
            <p className="text-xs text-zinc-500 mb-1">Parents</p>
            <p className="text-2xl font-bold">{node.parentCount}</p>
          </div>
        </div>

        {/* License Info */}
        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wide mb-2 block">
            License Type
          </label>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: node.commercialUse ? '#10b981' : '#f59e0b' }}
            />
            <span className="text-sm">{node.licenseType}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {node.commercialUse ? 'Commercial use allowed' : 'Non-commercial only'}
          </p>
        </div>

        {/* Owner */}
        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">
            Owner
          </label>
          <code className="text-sm bg-zinc-800 px-3 py-1.5 rounded block overflow-hidden text-ellipsis">
            {formatAddress(node.owner)}
          </code>
        </div>

        {/* Created Date */}
        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">
            Created
          </label>
          <p className="text-sm">{formatDate(node.timestamp)}</p>
        </div>

        {/* Revenue */}
        {node.revenue > 0 && (
          <div className="mb-4">
            <label className="text-xs text-zinc-500 uppercase tracking-wide mb-1 block">
              Total Revenue
            </label>
            <p className="text-lg font-bold">{node.revenue.toFixed(4)} IP</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-zinc-800">
          <Button
            variant="outline"
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            asChild
          >
            <a
              href={`${EXPLORER_URL}/assets/${node.ipId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer
            </a>
          </Button>
        </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
