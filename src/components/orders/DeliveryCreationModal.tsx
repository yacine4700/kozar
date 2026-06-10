"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { X, PackageCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Order, OrderItem } from '@/types';
import { createDelivery, DeliveryInputItem } from '@/actions/orders/create-delivery';

interface DeliveryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: (purchaseOrderId?: string) => void;
}

export const DeliveryCreationModal = ({ isOpen, onClose, order, onSuccess }: DeliveryCreationModalProps) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initialize quantities and prices when modal opens
  useEffect(() => {
    if (isOpen && order?.order_items) {
      const initialQuantities: Record<string, number> = {};
      const initialPrices: Record<string, number> = {};
      order.order_items.forEach(item => {
        const remaining = item.quantity - (item.fulfilled_quantity || 0);
        if (remaining > 0) {
          initialQuantities[item.id] = remaining;
          initialPrices[item.id] = item.unit_price;
        } else {
          initialQuantities[item.id] = 0;
          initialPrices[item.id] = item.unit_price;
        }
      });
      setQuantities(initialQuantities);
      setPrices(initialPrices);
      setNotes('');
      setError(null);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleQuantityChange = (itemId: string, val: string, max: number) => {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > max) num = max;
    
    setQuantities(prev => ({
      ...prev,
      [itemId]: num
    }));
  };

  const handlePriceChange = (itemId: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num) || num < 0) num = 0;
    
    setPrices(prev => ({
      ...prev,
      [itemId]: num
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const itemsToDeliver: DeliveryInputItem[] = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ 
        order_item_id: id, 
        quantity: qty,
        unit_price: prices[id] || 0
      }));

    if (itemsToDeliver.length === 0) {
      setError("يجب تحديد منتج واحد على الأقل للتوصيل بكمية أكبر من صفر.");
      return;
    }

    startTransition(async () => {
      const result = await createDelivery(order.id, itemsToDeliver, notes);
      
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess(result.purchaseOrderId);
      }
    });
  };

  const pendingItems = order.order_items?.filter(item => item.quantity - (item.fulfilled_quantity || 0) > 0) || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!isPending ? onClose : undefined}></div>
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <PackageCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">إنشاء وصل توصيل / فاتورة</h2>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                لطلب التاجر: {order.customers?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isPending}
            className="w-10 h-10 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {pendingItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageCheck size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">تم توصيل جميع المنتجات</h3>
              <p className="text-slate-500 font-medium">هذا الطلب مكتمل ولا توجد منتجات متبقية للتوصيل.</p>
            </div>
          ) : (
            <form id="delivery-form" onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-6">
                {(() => {
                  const groupedItems = pendingItems.reduce((acc, item) => {
                    const pId = item.product_id;
                    const pName = item.products?.name || 'منتج غير معروف';
                    const color = item.metadata?.color || 'بدون لون';
                    
                    if (!acc[pId]) acc[pId] = { productName: pName, colors: {} };
                    if (!acc[pId].colors[color]) acc[pId].colors[color] = [];
                    
                    acc[pId].colors[color].push(item);
                    return acc;
                  }, {} as Record<string, { productName: string; colors: Record<string, import('@/types').OrderItem[]> }>);

                  return Object.entries(groupedItems).map(([pId, group]) => (
                    <div key={pId} className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200">
                        <h4 className="text-xl font-black text-slate-800">{group.productName}</h4>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {Object.entries(group.colors).map(([color, items]) => (
                          <div key={color} className="p-6">
                            <div className="mb-4">
                              <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                {color === 'بدون لون' ? 'الكمية الإجمالية (بدون لون)' : `لون: ${color}`}
                              </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-right text-sm">
                                <thead>
                                  <tr className="text-slate-400 font-bold border-b border-slate-100">
                                    <th className="pb-3 px-2">المقاس / العمر</th>
                                    <th className="pb-3 px-2 text-center">الكمية المتبقية</th>
                                    <th className="pb-3 px-2 text-center">الكمية للتوصيل</th>
                                    <th className="pb-3 px-2 text-center">سعر الوحدة (د.ج)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map(item => {
                                    const remaining = item.quantity - (item.fulfilled_quantity || 0);
                                    
                                    return (
                                      <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2">
                                          <span className="font-black text-slate-700 text-base">
                                            {item.metadata?.size || '-'}
                                          </span>
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                          <span className="inline-flex items-center justify-center w-10 h-10 bg-amber-50 text-amber-700 font-black rounded-xl text-base">
                                            {remaining}
                                          </span>
                                        </td>
                                        <td className="py-4 px-2">
                                          <div className="flex justify-center">
                                            <input 
                                              type="number"
                                              min="0"
                                              max={remaining}
                                              value={quantities[item.id] !== undefined ? quantities[item.id] : ''}
                                              onChange={(e) => handleQuantityChange(item.id, e.target.value, remaining)}
                                              className="w-20 text-center font-black text-lg text-indigo-600 bg-white border-2 border-slate-200 rounded-xl py-2 focus:border-indigo-500 focus:ring-0 transition-colors"
                                            />
                                          </div>
                                        </td>
                                        <td className="py-4 px-2">
                                          <div className="flex justify-center">
                                            <input 
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={prices[item.id] !== undefined ? prices[item.id] : ''}
                                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                              className="w-28 text-center font-black text-lg text-slate-700 bg-white border-2 border-slate-200 rounded-xl py-2 focus:border-indigo-500 focus:ring-0 transition-colors"
                                            />
                                          </div>
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
                  ));
                })()}
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                  ملاحظات إضافية لوصل التوصيل (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-xl p-3 font-bold focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-300 text-sm"
                  placeholder="مثال: سيتم إرسال باقي الطلبية الأسبوع القادم..."
                ></textarea>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
          {pendingItems.length > 0 && (
            <button
              type="submit"
              form="delivery-form"
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء وتأكيد التوصيل'
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
