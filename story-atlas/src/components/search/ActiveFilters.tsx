'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';

export default function ActiveFilters() {
  const {
    searchQuery,
    licenseTypes,
    mediaTypes,
    commercialOnly,
    hasDerivatives,
    setSearchQuery,
    setLicenseTypes,
    setMediaTypes,
    setCommercialOnly,
    setHasDerivatives,
    reset,
  } = useFilterStore();

  const hasActiveFilters =
    searchQuery ||
    (licenseTypes && licenseTypes.length > 0) ||
    (mediaTypes && mediaTypes.length > 0) ||
    commercialOnly ||
    hasDerivatives;

  if (!hasActiveFilters) return null;

  const removeLicenseType = (type: string) => {
    if (licenseTypes) {
      setLicenseTypes(licenseTypes.filter((t) => t !== type));
    }
  };

  const removeMediaType = (type: string) => {
    if (mediaTypes) {
      setMediaTypes(mediaTypes.filter((t) => t !== type));
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap py-2 px-4 bg-zinc-900/50 border-y border-zinc-800">
      <span className="text-sm text-zinc-400">Active filters:</span>

      {searchQuery && (
        <div className="flex items-center gap-1 px-3 py-1 bg-zinc-800 rounded-full text-sm">
          <span className="text-zinc-300">Search: &quot;{searchQuery}&quot;</span>
          <button
            onClick={() => setSearchQuery('')}
            className="ml-1 text-zinc-500 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {licenseTypes && licenseTypes.map((type) => (
        <div
          key={type}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm"
        >
          <span className="text-blue-300">{type}</span>
          <button
            onClick={() => removeLicenseType(type)}
            className="ml-1 text-blue-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {mediaTypes && mediaTypes.map((type) => (
        <div
          key={type}
          className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm"
        >
          <span className="text-purple-300">{type}</span>
          <button
            onClick={() => removeMediaType(type)}
            className="ml-1 text-purple-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {commercialOnly && (
        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm">
          <span className="text-green-300">Commercial Only</span>
          <button
            onClick={() => setCommercialOnly(false)}
            className="ml-1 text-green-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {hasDerivatives && (
        <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-sm">
          <span className="text-amber-300">Has Derivatives</span>
          <button
            onClick={() => setHasDerivatives(false)}
            className="ml-1 text-amber-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={reset}
        className="text-zinc-400 hover:text-white text-xs"
      >
        Clear All
      </Button>
    </div>
  );
}
