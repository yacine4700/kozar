import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export function RecentOrders({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-lg font-black text-slate-800">أحدث الطلبات</h3>
        <Link 
          href="/orders" 
          className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
        >
          <span>عرض الكل</span>
          <ArrowLeft size={16} />
        </Link>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">رقم الطلب</th>
              <th className="px-6 py-4">العميل</th>
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-900 dir-ltr text-right">#{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{order.customers?.name || 'بدون اسم'}</td>
                <td className="px-6 py-4 text-slate-500 font-medium flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black ${
                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status === 'PENDING' ? 'قيد الانتظار' : order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
                  لا توجد طلبات حديثة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
