'use client';

import React, { useMemo } from 'react';
import { useIPAssets } from '@/lib/hooks/useIPAssets';
import { useGraphData } from '@/lib/hooks/useGraphData';
import StatsCards from '@/components/dashboard/StatsCards';
import LicenseDistribution from '@/components/dashboard/LicenseDistribution';
import MediaTypeChart from '@/components/dashboard/MediaTypeChart';
import TrendingIPs from '@/components/dashboard/TrendingIPs';
import IPsOverTime from '@/components/dashboard/IPsOverTime';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';

export default function AnalyticsPage() {
  const { assets, isLoading } = useIPAssets();
  // Reuse shared graph data to get edge-enriched nodes (with real derivative counts)
  const { graphData } = useGraphData();

  const stats = useMemo(() => {
    if (!assets.length) return null;

    const licenseDistribution: Record<string, number> = {};
    const mediaTypeDistribution: Record<string, number> = {};
    let commercialIPs = 0;

    assets.forEach(a => {
      // License distribution
      if (a.licenseTerms?.length) {
        const t = a.licenseTerms[0];
        let type = 'None';
        if (t.commercialUse && t.derivativesAllowed) type = 'Commercial Remix';
        else if (t.commercialUse) type = 'Commercial Only';
        else if (t.derivativesAllowed) type = 'Non-Commercial Remix';
        else type = 'Attribution Only';
        licenseDistribution[type] = (licenseDistribution[type] || 0) + 1;
        if (t.commercialUse) commercialIPs++;
      } else {
        licenseDistribution['No License'] = (licenseDistribution['No License'] || 0) + 1;
      }

      // Media type — derive from name/description heuristics since API rarely returns it
      const name = (a.metadata?.name || '').toLowerCase();
      let mediaType = a.metadata?.mediaType || 'other';
      if (mediaType === 'other') {
        if (name.includes('music') || name.includes('audio') || name.includes('beat') || name.includes('sound')) mediaType = 'audio';
        else if (name.includes('video') || name.includes('film') || name.includes('movie')) mediaType = 'video';
        else if (name.includes('art') || name.includes('image') || name.includes('photo') || name.includes('nft')) mediaType = 'image';
        else if (name.includes('text') || name.includes('story') || name.includes('book') || name.includes('write')) mediaType = 'text';
      }
      mediaTypeDistribution[mediaType] = (mediaTypeDistribution[mediaType] || 0) + 1;
    });

    // Use graph nodes for derivative counts (enriched with edges)
    const totalDerivatives = graphData.edges.length;
    const mostRemixedIPs = [...graphData.nodes]
      .sort((a, b) => b.derivativeCount - a.derivativeCount)
      .slice(0, 10)
      .filter(n => n.derivativeCount > 0)
      .map(n => ({ ipId: n.ipId, name: n.name, count: n.derivativeCount }));

    return {
      totalIPs: assets.length,
      totalDerivatives,
      commercialIPs,
      activeCreators: new Set(assets.map(a => a.owner)).size,
      avgDerivativesPerIP: assets.length > 0 ? totalDerivatives / assets.length : 0,
      licenseDistribution,
      mediaTypeDistribution,
      mostRemixedIPs,
    };
  }, [assets, graphData]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white">
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Graph</Link>
          </Button>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold">Analytics Dashboard</h1>
          </div>
          {!isLoading && (
            <span className="ml-auto text-xs text-zinc-500">{assets.length.toLocaleString()} IPs loaded</span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div className="space-y-8" variants={staggerContainer} initial="hidden" animate="visible">
            <section>
              <h2 className="text-lg font-semibold text-zinc-300 mb-4">Overview</h2>
              <StatsCards stats={stats} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LicenseDistribution data={stats.licenseDistribution} />
              <MediaTypeChart data={stats.mediaTypeDistribution} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IPsOverTime assets={assets} />
              <TrendingIPs mostRemixedIPs={stats.mostRemixedIPs} />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-300 mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Derivative Rate</p>
                  <p className="text-3xl font-bold text-green-400">
                    {((stats.totalDerivatives / stats.totalIPs) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">of loaded IPs have derivatives</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Commercial Adoption</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {((stats.commercialIPs / stats.totalIPs) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">of IPs allow commercial use</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Avg IPs per Creator</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {(stats.totalIPs / stats.activeCreators).toFixed(1)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">across {stats.activeCreators.toLocaleString()} creators</p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
}
