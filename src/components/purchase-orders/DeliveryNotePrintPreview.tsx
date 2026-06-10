"use client";

import React, { useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, Download } from 'lucide-react';
import { useSettings } from '@/providers/SettingsProvider';

import { createClient } from '@/utils/supabase/client';

interface DeliveryNotePrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId?: string;
}

export const DeliveryNotePrintPreview = ({ isOpen, onClose, purchaseOrderId }: DeliveryNotePrintPreviewProps) => {
  const settings = useSettings();
  const printRef = useRef<HTMLDivElement>(null);
  const [purchaseOrder, setPurchaseOrder] = React.useState<any>(null);
  const [items, setItems] = React.useState<any[]>([]);
  const supabase = createClient();
  
  React.useEffect(() => {
    if (isOpen && purchaseOrderId) {
      const fetchPO = async () => {
        const { data: po } = await supabase.from('purchase_orders').select('*').eq('id', purchaseOrderId).single();
        const { data: poi } = await supabase.from('purchase_order_items').select('*, products(name)').eq('purchase_order_id', purchaseOrderId);
        
        if (po) setPurchaseOrder(po);
        if (poi) setItems(poi);
      };
      fetchPO();
    } else if (!isOpen) {
      setPurchaseOrder(null);
      setItems([]);
    }
  }, [isOpen, purchaseOrderId]);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Delivery_Note_${purchaseOrder?.id?.split('-')[0] || 'Doc'}`,
  });

  // AGGREGATION LOGIC: Aggregate variant-level items strictly by product name for the print view
  const aggregatedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const map = new Map<string, { name: string; quantity: number; unitPrice: number; total: number }>();
    
    items.forEach(item => {
      // Depending on if items come from purchase_order_items or delivery_items joined with products
      const pName = item.product_name || item.products?.name || 'منتج غير معروف';
      const pId = item.product_id; // we group by product_id if available, else by name
      const key = pId || pName;
      
      const qty = item.quantity || 0;
      const price = item.unit_price || 0;
      
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.quantity += qty;
        existing.total += (qty * price);
      } else {
        map.set(key, {
          name: pName,
          quantity: qty,
          unitPrice: price,
          total: qty * price
        });
      }
    });
    
    return Array.from(map.values());
  }, [items]);

  if (!isOpen || !purchaseOrder) return null;

  const totalQuantity = aggregatedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = aggregatedItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Actions */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-xl font-black text-slate-800">معاينة الطباعة - وصل التوصيل</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handlePrint()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer size={18} />
              طباعة
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white border-2 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full flex items-center justify-center transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Print Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-200 flex justify-center">
          {/* A4 Document Container */}
          <div 
            ref={printRef}
            className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-md print:shadow-none print:w-full print:h-auto print:p-0"
            style={{ 
              fontFamily: "'Tajawal', 'Cairo', sans-serif" 
            }}
            dir="rtl"
          >
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">{settings?.workshop_name || 'زهرة الربيع'}</h1>
                <p className="text-sm font-bold text-slate-600 mb-1">{settings?.workshop_address || 'العنوان غير محدد'}</p>
                <div className="text-xs text-slate-500 font-bold space-y-1 mt-3">
                  {settings?.rc && <p>سجل تجاري: {settings.rc}</p>}
                  {settings?.nif && <p>رقم التعريف الجبائي: {settings.nif}</p>}
                  {settings?.nis && <p>رقم الإحصاء: {settings.nis}</p>}
                  {settings?.ai && <p>رقم المادة الجبائية: {settings.ai}</p>}
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-4xl font-black text-indigo-600 mb-4 tracking-tighter uppercase">وصل توصيل</h2>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <table className="text-sm">
                    <tbody>
                      <tr>
                        <td className="text-slate-500 font-bold py-1 pl-4">رقم الوصل:</td>
                        <td className="font-black text-slate-800 font-mono text-left">
                          {purchaseOrder.id.split('-')[0].toUpperCase()}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-slate-500 font-bold py-1 pl-4">التاريخ:</td>
                        <td className="font-black text-slate-800 text-left">
                          {new Date(purchaseOrder.created_at || Date.now()).toLocaleDateString('ar-DZ')}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-slate-500 font-bold py-1 pl-4">رقم الطلب:</td>
                        <td className="font-black text-slate-800 font-mono text-left">
                          {purchaseOrder.order_id?.split('-')[0].toUpperCase() || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">معلومات العميل</h3>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xl font-black text-slate-800 mb-2">{purchaseOrder?.customer_name || 'عميل غير محدد'}</h4>
                <div className="flex gap-8 text-sm font-bold text-slate-600">
                  <p>الهاتف: <span className="text-slate-800 font-mono ml-2" dir="ltr">{purchaseOrder?.customer_phone || '-'}</span></p>
                  <p>العنوان: <span className="text-slate-800">{purchaseOrder?.customer_address || '-'}</span></p>
                </div>
              </div>
            </div>

            {/* Aggregated Products Table */}
            <div className="mb-8 min-h-[300px]">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="py-3 px-2 font-black text-slate-800 w-16 text-center">#</th>
                    <th className="py-3 px-2 font-black text-slate-800">المنتج / البيان</th>
                    <th className="py-3 px-2 font-black text-slate-800 text-center w-32">الكمية الإجمالية</th>
                    <th className="py-3 px-2 font-black text-slate-800 text-center w-32">سعر الوحدة</th>
                    <th className="py-3 px-2 font-black text-slate-800 text-left w-32">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {aggregatedItems.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-4 px-2 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="py-4 px-2 font-black text-slate-800 text-lg">{item.name}</td>
                      <td className="py-4 px-2 text-center font-black text-slate-700 text-lg">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-2 text-center font-bold text-slate-600">
                        {item.unitPrice.toLocaleString('ar-DZ')} د.ج
                      </td>
                      <td className="py-4 px-2 text-left font-black text-slate-800">
                        {item.total.toLocaleString('ar-DZ')} د.ج
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Totals */}
            <div className="flex justify-end pt-6 border-t-2 border-slate-800">
              <div className="w-72 space-y-3">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-500">إجمالي القطع:</span>
                  <span className="font-black text-xl text-slate-800">{totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span className="font-black text-indigo-800">المبلغ الإجمالي:</span>
                  <span className="font-black text-2xl text-indigo-600">{totalAmount.toLocaleString('ar-DZ')} د.ج</span>
                </div>
              </div>
            </div>

            {/* Document Footer Note */}
            <div className="mt-16 text-center text-xs font-bold text-slate-400">
              <p>تم إنشاء هذا الوصل آلياً من نظام إدارة المخزون.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
