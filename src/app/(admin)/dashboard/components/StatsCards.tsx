import { DashboardStats } from "@/actions/dashboard/dashboard.actions";
import { ShoppingBag, Users, Package, AlertCircle } from "lucide-react";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="الطلبات قيد الانتظار" 
        value={stats.pendingOrdersCount} 
        icon={<ShoppingBag size={24} />} 
        colorClass="bg-amber-50 text-amber-600 border-amber-100"
      />
      <StatCard 
        title="إجمالي العملاء" 
        value={stats.customersCount} 
        icon={<Users size={24} />} 
        colorClass="bg-sky-50 text-sky-600 border-sky-100"
      />
      <StatCard 
        title="أنواع المنتجات" 
        value={stats.productsCount} 
        icon={<Package size={24} />} 
        colorClass="bg-indigo-50 text-indigo-600 border-indigo-100"
      />
      <StatCard 
        title="تنبيهات عامة" 
        value={0} 
        icon={<AlertCircle size={24} />} 
        colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
      />
    </div>
  );
}

function StatCard({ title, value, icon, colorClass }: { title: string; value: number | string; icon: React.ReactNode; colorClass: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
