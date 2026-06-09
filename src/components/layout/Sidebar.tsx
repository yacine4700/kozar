"use client";

import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Box, ShoppingCart, Factory, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/actions/auth/auth.actions';
import { hasPageAccess, MinimalProfile } from '@/lib/permissions';
import { useSidebar } from './SidebarContext';
import { useSettings } from '@/providers/SettingsProvider';
import { useEffect } from 'react';

export function Sidebar({ profile }: { profile?: MinimalProfile | null }) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const settings = useSettings();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Content */}
      <aside className={`w-64 bg-white border-l border-slate-200 flex flex-col p-4 shrink-0 h-screen overflow-y-auto transition-transform duration-300 z-50 fixed lg:sticky top-0 right-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="mb-8 px-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-indigo-600 tracking-tighter truncate max-w-[180px]" title={settings?.workshop_name || 'زهرة الربيع'}>
              {settings?.workshop_name || 'زهرة الربيع'}
            </h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">لوحة التحكم</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 lg:hidden rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {hasPageAccess(profile, 'dashboard') && <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="لوحة القيادة" active={pathname.startsWith('/dashboard')} />}
          {hasPageAccess(profile, 'orders') && <SidebarLink href="/orders" icon={<ShoppingBag size={18} />} label="الطلبات" active={pathname.startsWith('/orders')} />}
          {hasPageAccess(profile, 'customers') && <SidebarLink href="/customers" icon={<Users size={18} />} label="العملاء" active={pathname.startsWith('/customers')} />}
          {hasPageAccess(profile, 'products') && <SidebarLink href="/products" icon={<Package size={18} />} label="المنتجات" active={pathname.startsWith('/products')} />}
          {hasPageAccess(profile, 'inventory') && <SidebarLink href="/inventory" icon={<Box size={18} />} label="المخزون" active={pathname.startsWith('/inventory')} />}
          {hasPageAccess(profile, 'purchase-orders') && <SidebarLink href="/purchase-orders" icon={<ShoppingCart size={18} />} label="طلبات الشراء" active={pathname.startsWith('/purchase-orders')} />}
          {hasPageAccess(profile, 'production') && <SidebarLink href="/production" icon={<Factory size={18} />} label="خطة الإنتاج" active={pathname.startsWith('/production')} />}
          {hasPageAccess(profile, 'settings') && <SidebarLink href="/settings" icon={<Settings size={18} />} label="الإعدادات" active={pathname.startsWith('/settings')} />}
        </nav>

        <form action={logout} className="mt-auto pt-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all group">
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </aside>
    </>
  );
}

const SidebarLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-bold transition-all group lg:rtl:flex-row-reverse ${
      active 
        ? 'bg-indigo-50 text-indigo-600' 
        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
    }`}
  >
    <div className={`group-hover:scale-110 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span>{label}</span>
  </Link>
);
