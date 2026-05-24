import Link from "next/link";
import { Plus, PackagePlus, Box } from "lucide-react";

export function QuickActions() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-black text-slate-800">إجراءات سريعة</h3>
      </div>
      
      <div className="p-6 flex flex-col gap-4">
        <ActionLink 
          href="/" 
          target="_blank"
          icon={<Plus size={20} />} 
          title="تسجيل طلب جديد" 
          description="فتح واجهة تسجيل الطلبات للعملاء"
          colorClass="bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white"
        />
        <ActionLink 
          href="/products" 
          icon={<PackagePlus size={20} />} 
          title="إضافة منتج جديد" 
          description="إدراج موديل جديد في الكتالوج"
          colorClass="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white"
        />
        <ActionLink 
          href="/inventory" 
          icon={<Box size={20} />} 
          title="تحديث المخزون" 
          description="إضافة أو سحب كميات من المخزون"
          colorClass="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
        />
      </div>
    </div>
  );
}

function ActionLink({ href, icon, title, description, colorClass, target }: { href: string; icon: React.ReactNode; title: string; description: string; colorClass: string; target?: string }) {
  return (
    <Link 
      href={href}
      target={target}
      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-slate-800 group-hover:text-sky-700 transition-colors">{title}</h4>
        <p className="text-xs font-medium text-slate-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}
