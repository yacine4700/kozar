import { LayoutDashboard, Users } from 'lucide-react';

interface ProtectedPagePlaceholderProps {
  title: string;
}

export const ProtectedPagePlaceholder = ({ title }: ProtectedPagePlaceholderProps) => {
  return (
    <main className="flex-1 p-8 lg:p-12 h-screen overflow-y-auto" dir="rtl">
      <header className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Users size={20} />
          </div>
        </div>
      </header>

      <section className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 animate-pulse text-slate-300">
          <LayoutDashboard size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-4">قيد التطوير</h3>
        <p className="text-slate-400 font-medium max-w-sm mx-auto">
          هذه الصفحة ({title}) قيد العمل حاليًا. سيتم ربط البيانات قريباً.
        </p>
      </section>
    </main>
  );
};
