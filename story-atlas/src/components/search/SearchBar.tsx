'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/stores/filterStore';
import { useSearchIPs } from '@/lib/hooks/useIPAssets';
import { IPAsset } from '@/lib/story-protocol/types';

interface SearchBarProps {
  onSelectIP?: (ipId: string) => void;
}

export default function SearchBar({ onSelectIP }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const { setSearchQuery } = useFilterStore();
  const { results, isLoading } = useSearchIPs(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Apply search to filter store
  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowResults(false);
    setSearchQuery('');
  };

  const handleSelectResult = (ip: IPAsset) => {
    setQuery(ip.metadata?.name || ip.ipId);
    setShowResults(false);
    if (onSelectIP) {
      onSelectIP(ip.ipId);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search IPs by name, creator, or address..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && query && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((ip) => (
                <button
                  key={ip.ipId}
                  onClick={() => handleSelectResult(ip)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors flex items-start gap-3"
                >
                  {/* Media Type Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
                    {ip.metadata?.mediaType === 'image' && '🖼️'}
                    {ip.metadata?.mediaType === 'audio' && '🎵'}
                    {ip.metadata?.mediaType === 'video' && '🎬'}
                    {ip.metadata?.mediaType === 'text' && '📄'}
                    {!ip.metadata?.mediaType && '📦'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {ip.metadata?.name || 'Unnamed IP'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatAddress(ip.ipId)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {ip.licenseTerms && ip.licenseTerms.length > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                          {ip.licenseTerms[0].commercialUse ? '💼 Commercial' : '🎨 Non-Commercial'}
                        </span>
                      )}
                      {ip.children && ip.children.length > 0 && (
                        <span className="text-xs text-zinc-500">
                          {ip.children.length} derivative{ip.children.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : debouncedQuery ? (
            <div className="py-8 text-center text-zinc-500">
              <p>No results found for &quot;{debouncedQuery}&quot;</p>
              <p className="text-sm mt-1">Try searching by IP name or address</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
