"use client";

import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, Phone, User, ExternalLink } from 'lucide-react';
import { Order } from '@/types';
import { DeliveryCreationModal } from './DeliveryCreationModal';

interface OrderDetailsProps {
  order: Order | null;
  onDeliveryCreated: () => void;
}

export const OrderDetails = ({ order, onDeliveryCreated }: OrderDetailsProps) => {
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-500 mb-2">لم يتم تحديد أي طلب</h3>
        <p className="font-medium text-lg">الرجاء اختيار طلب من القائمة لعرض التفاصيل وإدارة التوصيلات.</p>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED' as any;
  const isPending = order.status === 'PENDING';
  const isPartial = order.status === 'PARTIALLY_FULFILLED' || order.status === 'SHIPPED' as any;

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" dir="rtl">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-6 items-start justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-black text-slate-800">تفاصيل الطلب</h2>
            <span className="text-sm font-mono font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
              {order.id.split('-')[0].toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
            <Clock size={16} />
            {new Date(order.created_at).toLocaleString('ar-DZ')}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm ${
            isCompleted ? 'bg-green-100 text-green-700 border border-green-200' :
            isPartial ? 'bg-amber-100 text-amber-700 border border-amber-200' :
            'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {isCompleted && <CheckCircle2 size={16} />}
            {isPartial && <Truck size={16} />}
            {isPending && <Clock size={16} />}
            {
              isCompleted ? 'مكتمل بالكامل' :
              isPartial ? 'قيد التوصيل (جزئي)' :
              'قيد الانتظار'
            }
          </div>
          
          {!isCompleted && (
            <button 
              onClick={() => setIsDeliveryModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 text-sm"
            >
              <Truck size={16} />
              تجهيز وصل توصيل
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        
        {/* Customer Details */}
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute -left-12 -bottom-12 opacity-10">
            <User size={200} />
          </div>
          <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest mb-6 flex items-center gap-2">
            <User size={16} /> معلومات العميل
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <span className="text-xs font-bold text-indigo-300 block mb-1">التاجر / المتجر</span>
              <p className="text-2xl font-black">{order.customers?.name}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-300 block mb-1">الهاتف</span>
              <p className="text-xl font-bold font-mono" dir="ltr">{order.customers?.phone || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-xs font-bold text-indigo-300 block mb-1">العنوان</span>
              <p className="text-lg font-bold flex items-center gap-2">
                <MapPin size={18} className="text-indigo-300" />
                {order.customers?.address || 'غير محدد'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-600" />
            المنتجات المطلوبة
          </h3>

          <div className="space-y-6">
            {(() => {
              // Group items by product and color, filtering out fully fulfilled items
              const pendingItems = order.order_items?.filter(item => {
                const remaining = item.quantity - (item.fulfilled_quantity || 0);
                return remaining > 0;
              }) || [];

              if (pendingItems.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">جميع المنتجات مكتملة</h3>
                    <p className="text-slate-500 font-medium">تم توصيل جميع عناصر هذا الطلب.</p>
                  </div>
                );
              }

              const groupedItems = pendingItems.reduce((acc, item) => {
                const pId = item.product_id;
                const pName = item.products?.name || 'منتج غير معروف';
                const color = item.metadata?.color || 'بدون لون';
                
                if (!acc[pId]) {
                  acc[pId] = { productName: pName, colors: {} };
                }
                if (!acc[pId].colors[color]) {
                  acc[pId].colors[color] = [];
                }
                
                acc[pId].colors[color].push(item);
                return acc;
              }, {} as Record<string, { productName: string; colors: Record<string, import('@/types').OrderItem[]> }>);

              if (!groupedItems) return null;

              return Object.entries(groupedItems).map(([pId, group]) => (
                <div key={pId} className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  {/* Product Header */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                    <h4 className="text-xl font-black text-slate-800">{group.productName}</h4>
                  </div>
                  
                  {/* Colors List */}
                  <div className="divide-y divide-slate-100">
                    {Object.entries(group.colors).map(([color, items]) => (
                      <div key={color} className="p-6">
                        <div className="mb-4">
                          <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                            {color === 'بدون لون' ? 'الكمية الإجمالية (بدون لون)' : `لون: ${color}`}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {items.map(item => {
                            const ordered = item.quantity;
                            const fulfilled = item.fulfilled_quantity || 0;
                            const remaining = ordered - fulfilled;
                            const percent = Math.round((fulfilled / ordered) * 100);
                            const isItemComplete = remaining === 0;

                            return (
                              <div key={item.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden">
                                {item.metadata?.size && (
                                  <div className="text-sm font-black text-slate-700 mb-3">
                                    مقاس: {item.metadata.size}
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-end mb-3">
                                  <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-500">
                                      مطلوب: <span className="text-slate-800 font-black text-sm">{ordered}</span>
                                    </div>
                                    <div className="text-xs font-bold text-green-600">
                                      تم: <span className="font-black text-sm">{fulfilled}</span>
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    <div className="text-xs font-bold text-slate-400 mb-1">متبقي</div>
                                    <div className={`text-xl font-black ${isItemComplete ? 'text-slate-300' : 'text-amber-500'}`}>
                                      {remaining}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${isItemComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

      </div>

      <DeliveryCreationModal 
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        order={order}
        onSuccess={() => {
          setIsDeliveryModalOpen(false);
          onDeliveryCreated();
        }}
      />
    </div>
  );
};
