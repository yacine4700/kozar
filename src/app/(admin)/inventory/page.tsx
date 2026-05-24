import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Box, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/auth/auth.actions';
import { InventoryManager } from '@/components/inventory/InventoryManager';
import { createClient } from '@/utils/supabase/server';

export default async function InventoryPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*, products(*)')
    .order('updated_at', { ascending: false });

  const { data: stockMovements } = await supabase
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="h-screen overflow-y-auto p-8 lg:p-12" dir="rtl">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة المخزون</h2>
            <p className="text-sm font-bold text-slate-500 mt-2">تتبع حركات المخزون وإضافة الإنتاج الجديد</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
              <Box size={20} />
            </div>
          </div>
        </header>

        <div className="max-w-6xl">
          <InventoryManager 
            products={products || []} 
            variants={variants || []}
            movements={stockMovements || []}
          />
        </div>
      </main>
  );
}
