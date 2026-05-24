import { getCurrentProfile } from '@/actions/auth/auth.actions';
import { hasPageAccess } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getDashboardStats } from '@/actions/dashboard/dashboard.actions';
import { StatsCards } from './components/StatsCards';
import { RecentOrders } from './components/RecentOrders';
import { QuickActions } from './components/QuickActions';
import { LayoutDashboard } from 'lucide-react';

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  
  if (!hasPageAccess(profile, 'dashboard')) {
    if (profile && profile.role !== 'admin') {
      const pages = ['orders', 'inventory', 'production', 'customers', 'products', 'purchase-orders', 'settings'];
      for (const page of pages) {
        if (profile.permissions?.pages?.[page]) {
          redirect(`/${page}`);
        }
      }
    }
    // Fallback if no pages are accessible
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 w-full" dir="rtl">
        <h2 className="text-2xl font-black text-slate-800 mb-2">عذراً، لا تملك صلاحية الوصول لأي صفحة</h2>
      </div>
    );
  }

  const { data: stats, error } = await getDashboardStats();

  return (
    <main className="flex-1 p-8 lg:p-12 min-h-screen flex flex-col gap-8" dir="rtl">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-sky-500" size={32} />
            لوحة القيادة
          </h2>
          <p className="text-slate-500 font-medium mt-2">نظرة عامة على نشاط الورشة والطلبات الحالية.</p>
        </div>
      </header>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold">
          {error}
        </div>
      ) : (
        <>
          <StatsCards stats={stats!} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentOrders orders={stats!.recentOrders} />
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
