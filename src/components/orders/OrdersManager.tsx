"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Truck, CheckCircle2, Clock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { OrderDetails } from './OrderDetails';
import { deleteOrder } from '@/actions/orders/delete-order';

interface OrdersManagerProps {
  orders: Order[];
}

export const OrdersManager = ({ orders }: OrdersManagerProps) => {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const shortId = o.id.split('-')[0].toLowerCase();
    const customerName = o.customers?.name?.toLowerCase() || '';
    return shortId.includes(search) || customerName.includes(search);
  });

  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    startTransition(async () => {
      const result = await deleteOrder(orderToDelete.id);
      
      if (result.success) {
        setOrderToDelete(null);
        if (selectedOrderId === orderToDelete.id) {
          setSelectedOrderId(null);
        }
      } else {
        alert(result.error || 'حدث خطأ أثناء الحذف');
      }
    });
  };

  const handleDeliveryCreated = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6" dir="rtl">
      
      {/* Left Pane: Orders List */}
      <div className={`w-full lg:w-1/3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden shrink-0 lg:sticky lg:top-8 lg:max-h-[calc(100vh-100px)] ${selectedOrderId ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <input 
              type="text" 
              placeholder="ابحث برقم الطلب أو اسم العميل..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 pl-4 pr-10 text-sm font-bold focus:border-indigo-500 focus:ring-0 transition-colors"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium text-sm">
              لا توجد طلبات مطابقة.
            </div>
          ) : (
            filteredOrders.map(order => {
              const isSelected = selectedOrderId === order.id;
              const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED' as any;
              const isPending = order.status === 'PENDING';
              const isPartial = order.status === 'PARTIALLY_FULFILLED' || order.status === 'SHIPPED' as any;
              
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full text-right p-3 rounded-xl border-2 transition-all group relative ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-500 shadow-sm shadow-indigo-100/50' 
                      : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                      #{order.id.split('-')[0].toUpperCase()}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                      isCompleted ? 'text-green-600 bg-green-50' :
                      isPartial ? 'text-amber-600 bg-amber-50' :
                      'text-slate-500 bg-slate-100'
                    }`}>
                      {isCompleted && <CheckCircle2 size={12} />}
                      {isPartial && <Truck size={12} />}
                      {isPending && <Clock size={12} />}
                      {isCompleted ? 'مكتمل' : isPartial ? 'توصيل جزئي' : 'قيد الانتظار'}
                    </span>
                  </div>
                  
                  <h4 className="text-base font-black text-slate-800 mb-1 truncate">
                    {order.customers?.name || 'عميل محذوف'}
                  </h4>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                    </span>
                    
                    <div 
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToDelete(order);
                      }}
                      title="حذف الطلب"
                    >
                      <Trash2 size={16} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Details */}
      <div className={`w-full lg:w-2/3 ${selectedOrderId ? 'block' : 'hidden lg:block'}`}>
        <OrderDetails 
          order={selectedOrder} 
          onDeliveryCreated={handleDeliveryCreated}
          onBack={() => setSelectedOrderId(null)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isPending && setOrderToDelete(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">تأكيد حذف الطلب</h3>
            <p className="text-slate-500 font-medium mb-8">
              هل أنت متأكد من حذف الطلب <span className="font-mono font-bold">#{orderToDelete.id.split('-')[0].toUpperCase()}</span> الخاص بالعميل <span className="text-slate-800 font-bold">"{orderToDelete.customers?.name}"</span>؟
              <br/>
              <span className="text-red-500 text-sm mt-2 block">ملاحظة: لا يمكن حذف طلب له إيصالات توصيل سابقة.</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setOrderToDelete(null)}
                disabled={isPending}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  'نعم، احذف الطلب'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
