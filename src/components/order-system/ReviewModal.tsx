"use client";

import React from 'react';
import { ModelOrder, ColorOrder, Product } from '@/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  customer: {
    merchantName: string;
    state: string;
  };
  selectedModels: ModelOrder[];
  products: Product[];
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  customer,
  selectedModels,
  products
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-700">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
           <div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">مراجعة نهائية</h2>
             <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">تأكد من دقة المعلومات قبل الإرسال</p>
           </div>
           <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <span className="text-xs font-black text-indigo-200 uppercase tracking-widest block mb-1">التاجر</span>
                <p className="text-xl font-black">{customer.merchantName}</p>
              </div>
              <div>
                <span className="text-xs font-black text-indigo-200 uppercase tracking-widest block mb-1">الموقع</span>
                <p className="text-xl font-black">{customer.state}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {selectedModels.map(model => {
              const product = products.find(p => p.id === model.productId);
              if (!product) return null;
              
              const hasSizes = product.sizes && product.sizes.length > 0;
              const hasColors = product.colors && product.colors.length > 0;

              return (
                <div key={model.modelName} className="border-b border-slate-100 last:border-0 pb-8 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-indigo-700">{model.modelName}</h3>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-black text-slate-500">تم الاختيار</span>
                  </div>
                  <div className="space-y-4">
                    {(Object.entries(model.colorOrders) as [string, ColorOrder][]).map(([colorKey, order]) => {
                      const hasQuantities = hasSizes 
                        ? product.sizes.some((age: string) => (Number(order.quantities[age]) || 0) > 0)
                        : (Number(order.singleQuantity) || 0) > 0;
                      
                      if (!hasQuantities) return null;

                      return (
                        <div key={colorKey} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                          <div className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">
                            {hasColors ? `لون: ${colorKey}` : 'الكمية المطلوبة'}
                          </div>
                          {hasSizes ? (
                            <div className="flex flex-wrap gap-3">
                              {product.sizes.map((age: string) => {
                                const qty = Number(order.quantities[age]) || 0;
                                if (qty === 0) return null;
                                return (
                                  <div key={age} className="bg-white px-4 py-2 rounded-xl border-2 border-slate-100 flex items-center gap-3 shadow-sm">
                                    <span className="text-sm font-bold text-slate-400">{age}:</span>
                                    <span className="text-lg font-black text-indigo-600 tabular-nums">{qty}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-white px-6 py-3 rounded-xl border-2 border-slate-100 inline-flex items-center gap-4 shadow-sm">
                              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">العدد الإجمالي:</span>
                              <span className="text-3xl font-black text-indigo-600 tabular-nums">{order.singleQuantity}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-6">
           <button 
            onClick={onClose}
            className="flex-1 px-8 py-5 rounded-2xl border-2 border-slate-200 font-black text-slate-500 bg-white hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-4 text-lg"
           >
             <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
             تعديل
           </button>
           <button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-[2] px-8 py-5 rounded-2xl bg-slate-900 text-white font-black shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4 text-xl ${isSubmitting ? 'opacity-70' : ''}`}
           >
             {isSubmitting ? (
               <div className="flex items-center gap-4">
                 <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 جاري المعالجة...
               </div>
             ) : (
               <>
                 <span>إرسال الطلبية الآن</span>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};
