'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { IPAsset } from '@/lib/story-protocol/types';

interface IPsOverTimeProps {
  assets: IPAsset[];
}

export default function IPsOverTime({ assets }: IPsOverTimeProps) {
  // Group assets by date
  const groupByDate = () => {
    const grouped = new Map<string, number>();
    
    assets.forEach(asset => {
      const date = new Date(asset.blockTimestamp * 1000);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1);
    });

    // Convert to array and sort by date
    const sorted = Array.from(grouped.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const dateA = new Date(a.date + ', 2024');
        const dateB = new Date(b.date + ', 2024');
        return dateA.getTime() - dateB.getTime();
      });

    // Calculate cumulative
    let cumulative = 0;
    return sorted.map(item => {
      cumulative += item.count;
      return {
        date: item.date,
        daily: item.count,
        total: cumulative,
      };
    });
  };

  const chartData = groupByDate();

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">IPs Created Over Time</h3>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="date" 
              stroke="#a1a1aa"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#a1a1aa"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTotal)"
              name="Total IPs"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          No timeline data available
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 p-3 rounded-lg">
          <p className="text-xs text-zinc-400 mb-1">Daily Average</p>
          <p className="text-xl font-bold text-white">
            {(chartData.reduce((sum, d) => sum + d.daily, 0) / chartData.length || 0).toFixed(1)}
          </p>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg">
          <p className="text-xs text-zinc-400 mb-1">Peak Day</p>
          <p className="text-xl font-bold text-white">
            {Math.max(...chartData.map(d => d.daily), 0)}
          </p>
        </div>
      </div>
    </Card>
  );
}
