"use client";

import React from 'react';
import { X, History, ArrowDownRight, ArrowUpRight, Clock, FileText, Settings, PackagePlus } from 'lucide-react';
import { Product, StockMovement } from '@/types';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  color?: string;
  size?: string;
  movements: StockMovement[];
}

export const StockHistoryModal = ({ isOpen, onClose, product, color, size, movements }: StockHistoryModalProps) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end" dir="rtl">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <History size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">سجل المخزون</h2>
            </div>
            <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {product.name}
              {color && size && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {color} - {size}
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="p-8 pb-4 shrink-0">
          <div className="bg-slate-800 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl shadow-slate-200">
            <div>
              <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">المخزون الحالي</p>
              <div className="text-4xl font-black">{product.stock_quantity}</div>
            </div>
            <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center text-slate-300">
              <PackagePlus size={32} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">الحركات الأخيرة</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {movements.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium">
                لا توجد حركات مسجلة لهذا المنتج.
              </div>
            ) : (
              movements.map((movement, i) => {
                const isAdd = movement.type === 'IN';
                
                return (
                  <div key={movement.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                      isAdd ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isAdd ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group-hover:border-indigo-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-black text-lg ${isAdd ? 'text-green-600' : 'text-red-600'}`}>
                          {isAdd ? '+' : '-'}{movement.quantity}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(movement.created_at).toLocaleDateString('ar-DZ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {movement.reason !== 'ORDER' && isAdd && (
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <Settings size={12} /> إضافة
                          </span>
                        )}
                        {movement.reason !== 'ORDER' && !isAdd && (
                          <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <Settings size={12} /> نقصان
                          </span>
                        )}
                        {movement.reason === 'ORDER' && (
                          <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <FileText size={12} /> طلبية {movement.order_id?.split('-')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
