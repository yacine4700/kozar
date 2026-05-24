import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Box, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/auth/auth.actions';
import { ProductsManager } from '@/components/products/ProductsManager';
import { createClient } from '@/utils/supabase/server';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  return (
    <main className="flex-1 p-8 lg:p-12" dir="rtl">
      <header className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة المنتجات</h2>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Package size={20} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl">
        <ProductsManager products={products || []} />
      </div>
    </main>
  );
}
