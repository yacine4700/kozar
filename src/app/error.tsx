"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 text-center shadow-xl border border-red-100">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-4">عذراً، حدث خطأ ما</h2>
        <p className="text-slate-500 mb-8">لقد واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى.</p>
        <button
          onClick={() => reset()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-100"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}
