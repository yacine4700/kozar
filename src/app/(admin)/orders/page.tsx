import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Box, ShoppingCart, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { logout, getCurrentProfile } from '@/actions/auth/auth.actions';
import { createClient } from '@/utils/supabase/server';
import { OrdersManager } from '@/components/orders/OrdersManager';
import { hasPageAccess } from '@/lib/permissions';

export default async function OrdersPage() {
  const profile = await getCurrentProfile();
  
  if (!hasPageAccess(profile, 'orders')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 w-full" dir="rtl">
        <ShieldAlert size={64} className="text-red-400 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">عذراً، لا تملك صلاحية الوصول</h2>
        <p>ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      customers (*),
      order_items (
        *,
        products (*)
      )
    `)
    .neq('status', 'COMPLETED')
    .order('created_at', { ascending: false });

  return (
    <main className="flex-1 p-4 lg:p-8 min-h-screen" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الطلبات والتوصيل</h2>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <ShoppingBag size={20} />
          </div>
        </div>
      </header>

      <div>
        <OrdersManager orders={orders || []} />
      </div>
    </main>
  );
}
