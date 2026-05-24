import React from 'react';

interface SuccessViewProps {
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ onReset }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in duration-700 border border-slate-100">
        <div className="w-28 h-28 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl transform rotate-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-6">تم استلام الطلب!</h1>
        <p className="text-slate-500 mb-12 leading-relaxed text-xl font-medium">
          شكرًا لثقتكم بمتجر <span className="text-indigo-600 font-black">زهرة الربيع</span>. سنقوم بمراجعة طلبيتك والتواصل معك عبر الواتساب لتأكيد الشحن.
        </p>
        <button
          onClick={onReset}
          className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 text-lg"
        >
          إرسال طلبية جديدة
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
