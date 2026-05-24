"use client";

import React, { useState, useTransition } from 'react';
import { Package, Plus, History, AlertTriangle, CheckCircle2, Box, X, Check, Loader2, Search, Filter } from 'lucide-react';
import { Product, StockMovement, ProductVariant } from '@/types';
import { StockHistoryModal } from './StockHistoryModal';
import { addStock } from '@/actions/inventory/add-stock';

interface InventoryManagerProps {
  products: Product[];
  variants: ProductVariant[];
  movements: StockMovement[];
}

export const InventoryManager = ({ products, variants, movements }: InventoryManagerProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantContext, setSelectedVariantContext] = useState<{ color: string, size: string } | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Inline Editor State
  const [expandedVariant, setExpandedVariant] = useState<{ productId: string, color: string, size: string } | null>(null);
  const [inlineQuantity, setInlineQuantity] = useState('');
  const [inlineAction, setInlineAction] = useState<'ADD' | 'REMOVE'>('ADD');
  const [isPending, startTransition] = useTransition();
  const [inlineError, setInlineError] = useState<string | null>(null);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { icon: <AlertTriangle size={14} />, label: 'نفد المخزون', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (stock < 50) return { icon: <AlertTriangle size={14} />, label: 'مخزون منخفض', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { icon: <CheckCircle2 size={14} />, label: 'متوفر', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  const handleViewHistoryClick = (product: Product, color: string, size: string) => {
    setSelectedProduct(product);
    setSelectedVariantContext({ color, size });
    setIsHistoryModalOpen(true);
  };

  const handleOpenInline = (product: Product, color: string, size: string) => {
    setExpandedVariant({ productId: product.id, color, size });
    setInlineQuantity('');
    setInlineAction('ADD');
    setInlineError(null);
  };

  const handleCloseInline = () => {
    setExpandedVariant(null);
    setInlineQuantity('');
  };

  const handleInlineSubmit = (product: Product, color: string, size: string) => {
    if (!inlineQuantity || parseInt(inlineQuantity) <= 0) return;

    setInlineError(null);

    startTransition(async () => {
      const result = await addStock(product.id, color, size, parseInt(inlineQuantity), inlineAction);

      if (result.error) {
        setInlineError(result.error);
      } else {
        handleCloseInline();
      }
    });
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (stockFilter !== 'ALL') {
      const productVariants = variants.filter(v => v.product_id === product.id);
      const colors = product.colors && product.colors.length > 0 ? product.colors : ['بدون لون'];
      const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['بدون مقاس'];
      
      let hasMatch = false;
      for (const color of colors) {
        for (const size of sizes) {
          const variantRecord = productVariants.find(v => v.color === color && v.size === size);
          const stock = variantRecord ? variantRecord.stock_quantity : 0;
          if (stockFilter === 'OUT_OF_STOCK' && stock <= 0) hasMatch = true;
          if (stockFilter === 'LOW_STOCK' && stock > 0 && stock < 50) hasMatch = true;
          if (stockFilter === 'IN_STOCK' && stock >= 50) hasMatch = true;
        }
      }
      if (!hasMatch) return false;
    }
    return true;
  });

  return (
    <div className="w-full" dir="rtl">

      {/* Controls Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="ابحث عن منتج..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold focus:border-indigo-500 focus:ring-0 transition-colors shadow-sm"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        
        <div className="flex bg-white border-2 border-slate-200 rounded-2xl p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${stockFilter === 'ALL' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            الكل
          </button>
          <button
            onClick={() => setStockFilter('IN_STOCK')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${stockFilter === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            متوفر
          </button>
          <button
            onClick={() => setStockFilter('LOW_STOCK')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${stockFilter === 'LOW_STOCK' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            منخفض
          </button>
          <button
            onClick={() => setStockFilter('OUT_OF_STOCK')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${stockFilter === 'OUT_OF_STOCK' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            نفد
          </button>
        </div>
      </div>

      {/* Main Content - Inline List Layout */}
      <div className="space-y-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-medium">
            لا يوجد منتجات مطابقة للبحث.
          </div>
        ) : (
          filteredProducts.map(product => {
            const productVariants = variants.filter(v => v.product_id === product.id);
            const totalStock = productVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
            const colors = product.colors && product.colors.length > 0 ? product.colors : ['بدون لون'];
            const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['بدون مقاس'];

            return (
              <div key={product.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

                {/* Product Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="text-lg font-black text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-500 shadow-sm">
                      <Package size={16} />
                    </div>
                    {product.name}
                  </h4>
                  <div className="text-sm font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                    إجمالي المخزون: <span className="text-lg font-black text-slate-800 ml-1">{totalStock}</span>
                  </div>
                </div>

                {/* Colors & Sizes Structure */}
                <div className="p-6 space-y-8">
                  {colors.map(color => {
                    const filteredSizes = sizes.filter(size => {
                      if (stockFilter === 'ALL') return true;
                      const variantRecord = productVariants.find(v => v.color === color && v.size === size);
                      const stock = variantRecord ? variantRecord.stock_quantity : 0;
                      if (stockFilter === 'OUT_OF_STOCK') return stock <= 0;
                      if (stockFilter === 'LOW_STOCK') return stock > 0 && stock < 50;
                      if (stockFilter === 'IN_STOCK') return stock >= 50;
                      return true;
                    });
                    
                    if (filteredSizes.length === 0) return null;

                    return (
                      <div key={color}>
                        <div className="mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <h5 className="text-base font-black text-slate-700">
                            {color === 'بدون لون' ? 'الكمية الإجمالية (بدون لون)' : color}
                          </h5>
                        </div>

                        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                          <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                              <tr>
                                <th className="px-5 py-3 w-1/4">المقاس / الفئة</th>
                                <th className="px-5 py-3 w-1/5">المخزون الحالي</th>
                                <th className="px-5 py-3 w-1/5">الحالة</th>
                                <th className="px-5 py-3 w-1/5">آخر تحديث</th>
                                <th className="px-5 py-3 text-center">الإجراءات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredSizes.map(size => {
                              const variantRecord = productVariants.find(v => v.color === color && v.size === size);
                              const stock = variantRecord ? variantRecord.stock_quantity : 0;
                              const status = getStockStatus(stock);
                              const updatedDate = variantRecord ? new Date(variantRecord.updated_at).toLocaleDateString('ar-DZ') : '-';
                              const isExpanded = expandedVariant?.productId === product.id && expandedVariant?.color === color && expandedVariant?.size === size;

                              return (
                                <React.Fragment key={size}>
                                  <tr className={`group transition-colors ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                                    <td className="px-5 py-4 font-bold text-slate-700">
                                      {size !== 'بدون مقاس' ? size : '-'}
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="text-xl font-black text-slate-800 font-mono bg-slate-100 px-3 py-1 rounded-lg">
                                        {stock}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs ${status.bg} ${status.color}`}>
                                        {status.icon}
                                        {status.label}
                                      </div>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-slate-400">
                                      {updatedDate}
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className={`flex items-center justify-center gap-2 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}>
                                        <button
                                          onClick={() => isExpanded ? handleCloseInline() : handleOpenInline(product, color, size)}
                                          className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all flex items-center gap-1.5 ${isExpanded ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                        >
                                          {isExpanded ? <X size={16} /> : <Plus size={16} />}
                                          {isExpanded ? 'إلغاء' : 'إضافة'}
                                        </button>
                                        <button
                                          onClick={() => handleViewHistoryClick(product, color, size)}
                                          className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors flex items-center gap-1.5"
                                        >
                                          <History size={16} /> السجل
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Inline Add Stock Editor */}
                                  {isExpanded && (
                                    <tr>
                                      <td colSpan={5} className="bg-indigo-50/50 p-0 border-b border-indigo-100">
                                        <div className="px-6 py-5 animate-in slide-in-from-top-2 duration-200">
                                          <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-indigo-100 relative">

                                            {/* Pointer Triangle */}
                                            <div className="absolute -top-2 left-12 md:left-auto md:right-32 w-4 h-4 bg-white border-l border-t border-indigo-100 transform rotate-45"></div>

                                            <div className="flex-1 w-full">
                                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                                                الكمية
                                              </label>
                                              <input
                                                type="number"
                                                min="1"
                                                autoFocus
                                                value={inlineQuantity}
                                                onChange={(e) => setInlineQuantity(e.target.value)}
                                                className="w-full text-center text-xl font-black text-indigo-600 bg-slate-50 border border-slate-200 rounded-xl py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all outline-none"
                                                placeholder="0"
                                              />
                                            </div>

                                            <div className="flex-1 w-full">
                                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                                                نوع التعديل
                                              </label>
                                              <div className="flex bg-slate-100 p-1 rounded-xl">
                                                <button
                                                  onClick={() => setInlineAction('ADD')}
                                                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${inlineAction === 'ADD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                  إضافة
                                                </button>
                                                <button
                                                  onClick={() => setInlineAction('REMOVE')}
                                                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${inlineAction === 'REMOVE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                  نقصان
                                                </button>
                                              </div>
                                            </div>

                                            <button
                                              onClick={() => handleInlineSubmit(product, color, size)}
                                              disabled={isPending || !inlineQuantity || parseInt(inlineQuantity) <= 0}
                                              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                              تأكيد
                                            </button>
                                          </div>
                                          {inlineError && (
                                            <div className="mt-3 text-red-500 font-bold text-sm flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                                              <AlertTriangle size={14} />
                                              {inlineError}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            );
          })
        )}
      </div>

      {/* History Modal remains unchanged */}
      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        product={selectedProduct}
        color={selectedVariantContext?.color}
        size={selectedVariantContext?.size}
        movements={selectedProduct && selectedVariantContext ? movements.filter(m => m.product_id === selectedProduct.id && m.color === selectedVariantContext.color && m.size === selectedVariantContext.size) : []}
      />

    </div>
  );
};
