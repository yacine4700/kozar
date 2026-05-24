"use client";

import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Box, ShoppingCart, Factory, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth/auth.actions';
import { hasPageAccess, MinimalProfile } from '@/lib/permissions';

export function Sidebar({ profile }: { profile?: MinimalProfile | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col p-6 hidden lg:flex shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="mb-12 px-4">
        <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">زهرة الربيع</h1>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">لوحة التحكم</p>
      </div>

      <nav className="flex-1 space-y-2">
        {hasPageAccess(profile, 'dashboard') && <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="لوحة القيادة" active={pathname.startsWith('/dashboard')} />}
        {hasPageAccess(profile, 'orders') && <SidebarLink href="/orders" icon={<ShoppingBag size={20} />} label="الطلبات" active={pathname.startsWith('/orders')} />}
        {hasPageAccess(profile, 'customers') && <SidebarLink href="/customers" icon={<Users size={20} />} label="العملاء" active={pathname.startsWith('/customers')} />}
        {hasPageAccess(profile, 'products') && <SidebarLink href="/products" icon={<Package size={20} />} label="المنتجات" active={pathname.startsWith('/products')} />}
        {hasPageAccess(profile, 'inventory') && <SidebarLink href="/inventory" icon={<Box size={20} />} label="المخزون" active={pathname.startsWith('/inventory')} />}
        {hasPageAccess(profile, 'purchase-orders') && <SidebarLink href="/purchase-orders" icon={<ShoppingCart size={20} />} label="طلبات الشراء" active={pathname.startsWith('/purchase-orders')} />}
        {hasPageAccess(profile, 'production') && <SidebarLink href="/production" icon={<Factory size={20} />} label="خطة الإنتاج" active={pathname.startsWith('/production')} />}
        {hasPageAccess(profile, 'settings') && <SidebarLink href="/settings" icon={<Settings size={20} />} label="الإعدادات" active={pathname.startsWith('/settings')} />}
      </nav>

      <form action={logout} className="mt-auto pt-8">
        <button className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-all group">
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span>تسجيل الخروج</span>
        </button>
      </form>
    </aside>
  );
}

const SidebarLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group lg:rtl:flex-row-reverse ${
      active 
        ? 'bg-indigo-50 text-indigo-600' 
        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
    }`}
  >
    <div className={`group-hover:scale-110 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span>{label}</span>
  </Link>
);
