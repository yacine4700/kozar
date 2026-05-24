"use client";

import React from 'react';
import { MODEL_DESCRIPTIONS } from '@/constants';
import { Product } from '@/types';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  suggestions: Product[];
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleSuggestionClick: (name: string) => void;
  clearFilter: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  suggestions,
  handleSearchSubmit,
  handleSuggestionClick,
  clearFilter
}) => {
  return (
    <div className="max-w-2xl mx-auto relative">
      <form onSubmit={handleSearchSubmit} className="relative group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder="ابحث عن موديل (مثال: تلمساني، الأمير...)"
          className="w-full bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-[2rem] px-6 py-4 md:px-10 md:py-6 text-lg md:text-xl font-bold text-white placeholder:text-indigo-200/50 focus:bg-white focus:text-slate-900 focus:border-white focus:ring-8 focus:ring-white/10 outline-none transition-all shadow-2xl"
        />
        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
          {searchQuery && (
            <button 
              type="button"
              onClick={clearFilter}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button type="submit" className="p-3 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-400 transition-colors shadow-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {isSearchFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">الموديلات المقترحة</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSuggestionClick(product.id)}
                className="w-full text-right px-8 py-5 hover:bg-indigo-50 flex flex-col gap-1 transition-colors border-b border-slate-50 last:border-0 group"
              >
                <span className="text-lg font-black text-slate-800 group-hover:text-indigo-700">{product.name}</span>
                <span className="text-xs text-slate-400 font-medium line-clamp-1">
                  {product.description || MODEL_DESCRIPTIONS[product.name] || 'موديل رائع من مجموعتنا'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
