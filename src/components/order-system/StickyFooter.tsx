"use client";

import React from 'react';

interface StickyFooterProps {
  selectedCount: number;
  totalPieces: number;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({ selectedCount, totalPieces }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 px-6 py-4 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">الموديلات</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 tabular-nums">{selectedCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">نوع</span>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200/60 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">إجمالي القطع</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-indigo-600 tabular-nums">{totalPieces}</span>
              <span className="text-xs font-bold text-indigo-400 uppercase">قطعة</span>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="group w-full md:w-auto bg-slate-900 hover:bg-black text-white font-black py-3 px-8 md:py-4 md:px-12 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 text-lg md:text-xl"
        >
          <span>مراجعة الطلبية</span>
          <svg className="w-6 h-6 transition-transform group-hover:translate-x-[-6px] rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
