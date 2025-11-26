'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Network, GitBranch, Coins, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface StatsCardsProps {
  stats: {
    totalIPs: number;
    totalDerivatives: number;
    totalRevenue: string;
    avgDerivativesPerIP: number;
    commercialIPs: number;
    activeCreators: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total IP Assets',
      value: stats.totalIPs.toLocaleString(),
      icon: Network,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Derivatives',
      value: stats.totalDerivatives.toLocaleString(),
      icon: GitBranch,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Revenue',
      value: `${parseFloat(stats.totalRevenue).toFixed(2)} IP`,
      icon: Coins,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Avg Derivatives/IP',
      value: stats.avgDerivativesPerIP.toFixed(1),
      icon: TrendingUp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Commercial IPs',
      value: stats.commercialIPs.toLocaleString(),
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Active Creators',
      value: stats.activeCreators.toLocaleString(),
      icon: Users,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-zinc-900 border-zinc-800 p-6 transition-colors h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-2">{card.title}</p>
                <motion.p 
                  className="text-3xl font-bold text-white"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  {card.value}
                </motion.p>
              </div>
              <motion.div 
                className={`p-3 rounded-lg ${card.bgColor}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </motion.div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
