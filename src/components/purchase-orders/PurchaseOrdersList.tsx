"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Printer, FileText, Search } from 'lucide-react';
import { DeliveryNotePrintPreview } from './DeliveryNotePrintPreview';

export const PurchaseOrdersList = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPurchaseOrderId, setPreviewPurchaseOrderId] = useState<string | undefined>();
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        purchase_order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" dir="rtl">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800">أذونات التوصيل / طلبات الشراء</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-4">رقم الوصل</th>
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">العميل</th>
              <th className="px-6 py-4">رقم الطلب الأصلي</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-slate-700">
                  {po.id.split('-')[0].toUpperCase()}
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">
                  {new Date(po.created_at).toLocaleDateString('ar-DZ')}
                </td>
                <td className="px-6 py-4 font-black text-slate-800">
                  {po.customer_name || 'غير متوفر'}
                </td>
                <td className="px-6 py-4 font-mono text-indigo-600 font-bold">
                  {po.order_id?.split('-')[0].toUpperCase() || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => {
                      setPreviewPurchaseOrderId(po.id);
                      setIsPreviewOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Printer size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">
                  لا توجد أي أذونات توصيل حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeliveryNotePrintPreview 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        purchaseOrderId={previewPurchaseOrderId}
      />
    </div>
  );
};
