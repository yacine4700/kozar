import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Box, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/auth/auth.actions';
import { CustomersManager } from '@/components/customers/CustomersManager';
import { createClient } from '@/utils/supabase/server';

export default async function CustomersPage() {
  const supabase = await createClient();
  
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: stats } = await supabase
    .from('customer_statistics')
    .select('*');

  const customersWithStats = customers?.map(c => {
    const stat = stats?.find(s => s.customer_id === c.id);
    return {
      ...c,
      total_orders_count: stat?.total_orders_count || 0,
      total_deliveries_count: stat?.total_deliveries_count || 0,
      total_delivered_amount: stat?.total_delivered_amount || 0
    };
  });

  return (
    <main className="flex-1 p-8 lg:p-12" dir="rtl">
      <header className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة العملاء</h2>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Users size={20} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl">
        <CustomersManager customers={customersWithStats || []} />
      </div>
    </main>
  );
}
