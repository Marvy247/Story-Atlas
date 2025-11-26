'use client';

import React from 'react';
import { useIPAssets, useIPStats } from '@/lib/hooks/useIPAssets';
import StatsCards from '@/components/dashboard/StatsCards';
import LicenseDistribution from '@/components/dashboard/LicenseDistribution';
import MediaTypeChart from '@/components/dashboard/MediaTypeChart';
import TrendingIPs from '@/components/dashboard/TrendingIPs';
import IPsOverTime from '@/components/dashboard/IPsOverTime';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

export default function AnalyticsPage() {
  const { assets, isLoading: assetsLoading } = useIPAssets({ limit: 1000 });
  const { stats, isLoading: statsLoading } = useIPStats();

  const isLoading = assetsLoading || statsLoading;

  // Calculate additional stats
  const additionalStats = {
    totalIPs: assets.length,
    totalDerivatives: assets.filter(a => a.parents && a.parents.length > 0).length,
    totalRevenue: assets.reduce((sum, a) => sum + parseFloat(a.totalRevenue || '0'), 0).toString(),
    avgDerivativesPerIP: assets.length > 0 
      ? assets.reduce((sum, a) => sum + (a.children?.length || 0), 0) / assets.length 
      : 0,
    commercialIPs: assets.filter(a => 
      a.licenseTerms?.some(t => t.commercialUse)
    ).length,
    activeCreators: new Set(assets.map(a => a.owner)).size,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-zinc-400 hover:text-white"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Graph
                </Link>
              </Button>
              <div className="h-6 w-px bg-zinc-800" />
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <h1 className="text-xl font-bold">Analytics Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <motion.div 
            className="flex items-center justify-center h-[60vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              </motion.div>
              <motion.p 
                className="text-zinc-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Loading analytics data...
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Cards */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <StatsCards stats={additionalStats} />
            </section>

            {/* Charts Row 1 */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LicenseDistribution data={stats?.licenseDistribution || {}} />
              <MediaTypeChart data={stats?.mediaTypeDistribution || {}} />
            </section>

            {/* Charts Row 2 */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IPsOverTime assets={assets} />
              <TrendingIPs mostRemixedIPs={stats?.mostRemixedIPs || []} />
            </section>

            {/* Additional Insights */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Derivative Rate</p>
                  <p className="text-3xl font-bold text-green-400">
                    {assets.length > 0 
                      ? ((additionalStats.totalDerivatives / assets.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    of IPs have created derivatives
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Commercial Adoption</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {assets.length > 0 
                      ? ((additionalStats.commercialIPs / assets.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    of IPs allow commercial use
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Avg IPs per Creator</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {additionalStats.activeCreators > 0 
                      ? (assets.length / additionalStats.activeCreators).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    across {additionalStats.activeCreators} creators
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
}
