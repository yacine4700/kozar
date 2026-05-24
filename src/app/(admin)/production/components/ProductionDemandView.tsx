"use client";

import React, { useState } from 'react';
import { ProductionDemand } from '@/actions/production/get-demand';
import { Search, AlertTriangle, ChevronDown, ChevronUp, PackageCheck } from 'lucide-react';

interface Props {
  initialData: ProductionDemand[];
}

export function ProductionDemandView({ initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyShortages, setShowOnlyShortages] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const filteredData = initialData.filter(product => {
    if (searchQuery && !product.productName.includes(searchQuery)) {
      return false;
    }
    if (showOnlyShortages && product.totalNeeded <= 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="ابحث عن موديل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showOnlyShortages}
            onChange={(e) => setShowOnlyShortages(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"
          />
          <span className="text-sm font-bold text-gray-700">عرض النواقص فقط</span>
        </label>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <PackageCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">لا توجد بيانات</h3>
          <p className="text-gray-500 mt-2">لم يتم العثور على أي متطلبات إنتاج مطابقة لبحثك.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map(product => {
            const isExpanded = expandedProducts[product.productId];
            const hasShortage = product.totalNeeded > 0;

            // Group variants for this product by color, then size
            // For a simpler UI as requested: flat table or grouped by color
            // Let's group by Color
            const variantsByColor = product.variants.reduce((acc, variant) => {
              if (!acc[variant.color]) acc[variant.color] = [];
              acc[variant.color].push(variant);
              return acc;
            }, {} as Record<string, typeof product.variants>);

            return (
              <div key={product.productId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                  className={`p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${hasShortage ? 'hover:bg-red-50/30' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleExpand(product.productId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black text-gray-900">{product.productName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm font-bold text-gray-500">
                        <span>إجمالي المطلوب: <span className="text-indigo-600">{product.totalOrdered}</span></span>
                        <span>•</span>
                        <span>المخزون: <span className="text-emerald-600">{product.totalStock}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${hasShortage ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                      {hasShortage && <AlertTriangle className="w-4 h-4" />}
                      <span className="text-sm font-black uppercase tracking-widest">
                        النقص: {product.totalNeeded}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="space-y-6">
                      {Object.entries(variantsByColor).map(([color, variants]) => (
                        <div key={color} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-200">
                            <span className="text-sm font-black text-gray-700">لون: {color}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                              <thead className="bg-white text-gray-500 font-bold border-b border-gray-100">
                                <tr>
                                  <th className="px-4 py-3 w-1/4">المقاس / العمر</th>
                                  <th className="px-4 py-3 w-1/4">مطلوب للطلبات</th>
                                  <th className="px-4 py-3 w-1/4">في المخزن</th>
                                  <th className="px-4 py-3 w-1/4">النقص للإنتاج</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {variants.map((v, idx) => {
                                  const isShort = v.needed_quantity > 0;
                                  return (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-4 py-3 font-bold text-gray-700">{v.size}</td>
                                      <td className="px-4 py-3 font-bold text-gray-900">{v.pending_order_quantity}</td>
                                      <td className="px-4 py-3 font-bold text-gray-600">{v.current_stock}</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-black ${isShort ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {v.needed_quantity > 0 ? v.needed_quantity : 0}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
