import { getProductionDemand } from '@/actions/production/get-demand';
import { ProductionDemandView } from './components/ProductionDemandView';
import { Factory } from 'lucide-react';

export const metadata = {
  title: 'خطة الإنتاج | زهرة الربيع',
  description: 'نظرة عامة على متطلبات الإنتاج بناءً على الطلبات والمخزون الحالي.',
};

export default async function ProductionPage() {
  const { data, error } = await getProductionDemand();

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block font-bold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <Factory size={24} />
            <span className="font-black uppercase tracking-widest text-sm">التخطيط</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">خطة الإنتاج</h1>
          <p className="text-gray-500 font-medium mt-2">
            نظرة عامة على النواقص والكميات المطلوبة للتصنيع بناءً على الطلبات المعلقة.
          </p>
        </div>
      </header>

      <ProductionDemandView initialData={data || []} />
    </div>
  );
}
