'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function LegendPanel() {
  const [open, setOpen] = useState(false);

  const licenseTypes = [
    { name: 'Commercial Remix', color: '#10b981', description: 'Allows commercial use & derivatives' },
    { name: 'Commercial', color: '#3b82f6', description: 'Commercial use only' },
    { name: 'Non-Commercial Remix', color: '#f59e0b', description: 'Free derivatives only' },
    { name: 'Attribution Only', color: '#8b5cf6', description: 'Attribution required' },
    { name: 'None', color: '#6b7280', description: 'No license set' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 w-52 sm:w-64">
      {/* Toggle button — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-2 bg-zinc-900/95 border border-zinc-700 rounded-lg text-sm font-semibold text-zinc-200 backdrop-blur-sm hover:bg-zinc-800 transition-colors"
      >
        <span>Legend</span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="mt-1 bg-zinc-900/95 border border-zinc-700 rounded-lg p-3 backdrop-blur-sm">
          <div className="space-y-2">
            {licenseTypes.map((type) => (
              <div key={type.name} className="flex items-start gap-2.5">
                <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: type.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200">{type.name}</p>
                  <p className="text-xs text-zinc-500">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">Larger nodes = more derivatives</p>
          </div>
        </div>
      )}
    </div>
  );
}
