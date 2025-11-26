'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

interface TimeTravelSliderProps {
  minDate: number; // Unix timestamp
  maxDate: number; // Unix timestamp
  currentDate: number;
  onDateChange: (date: number) => void;
}

export default function TimeTravelSlider({
  minDate,
  maxDate,
  currentDate,
  onDateChange,
}: TimeTravelSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per step

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const step = (maxDate - minDate) / 100; // 100 steps
      const newDate = currentDate + step;

      if (newDate >= maxDate) {
        setIsPlaying(false);
        onDateChange(maxDate);
      } else {
        onDateChange(newDate);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentDate, minDate, maxDate, speed, onDateChange]);

  const handleReset = () => {
    setIsPlaying(false);
    onDateChange(maxDate);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const percentage = ((currentDate - minDate) / (maxDate - minDate)) * 100;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-zinc-900/95 backdrop-blur-sm border-zinc-800 p-4 w-[600px]">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-zinc-400 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Slider */}
          <div className="flex-1">
            <div className="relative">
              {/* Date Labels */}
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>{formatDate(minDate)}</span>
                <span className="font-semibold text-blue-400">
                  {formatDate(currentDate)}
                </span>
                <span>{formatDate(maxDate)}</span>
              </div>

              {/* Slider Track */}
              <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                {/* Progress */}
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${percentage}%` }}
                  transition={{ duration: 0.1 }}
                />

                {/* Slider Input */}
                <input
                  type="range"
                  min={minDate}
                  max={maxDate}
                  value={currentDate}
                  onChange={(e) => onDateChange(Number(e.target.value))}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Thumb */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500"
                  style={{ left: `${percentage}%`, marginLeft: '-8px' }}
                  animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                />
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-zinc-500">Speed:</span>
              {[
                { label: '0.5x', value: 2000 },
                { label: '1x', value: 1000 },
                { label: '2x', value: 500 },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setSpeed(s.value)}
                  className={`text-xs px-2 py-1 rounded ${
                    speed === s.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
