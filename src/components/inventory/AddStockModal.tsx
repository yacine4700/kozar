"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, PackagePlus, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { addStock } from '@/actions/inventory/add-stock';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialColor?: string;
  initialSize?: string;
}

export const AddStockModal = ({ isOpen, onClose, product, initialColor, initialSize }: AddStockModalProps) => {
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<'PRODUCTION' | 'MANUAL_ADJUSTMENT'>('PRODUCTION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state when product changes or modal opens
  useEffect(() => {
    if (product) {
      setColor(initialColor || (product.colors && product.colors.length > 0 ? product.colors[0] : 'بدون لون'));
      setSize(initialSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'بدون مقاس'));
    }
  }, [product, isOpen, initialColor, initialSize]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!color || !size) {
      setError("يجب اختيار اللون والمقاس");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const qtyNum = parseInt(quantity);
    const result = await addStock(product.id, color, size, qtyNum, 'ADD', reason);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setQuantity('');
      setReason('PRODUCTION');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <PackagePlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">إضافة مخزون</h3>
              <p className="text-xs font-bold text-slate-500 mt-0.5">{product.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                اللون
              </label>
              <select 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 px-4 font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
              >
                {product.colors && product.colors.length > 0 ? (
                  product.colors.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                ) : (
                  <option value="بدون لون">بدون لون</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                المقاس
              </label>
              <select 
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 px-4 font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
              >
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                ) : (
                  <option value="بدون مقاس">بدون مقاس</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              الكمية المضافة
            </label>
            <input 
              type="number" 
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-center text-3xl font-black text-indigo-600 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
              سبب الإضافة
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReason('PRODUCTION')}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  reason === 'PRODUCTION' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                }`}
              >
                إنتاج جديد
              </button>
              <button
                type="button"
                onClick={() => setReason('MANUAL_ADJUSTMENT')}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  reason === 'MANUAL_ADJUSTMENT' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                }`}
              >
                تعديل يدوي
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !quantity || parseInt(quantity) <= 0}
            className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                تأكيد الإضافة
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
