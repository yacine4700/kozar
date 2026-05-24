import { createClient } from '@/utils/supabase/server';
import { Database, CheckCircle2, XCircle, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let authStatus = { success: false, message: 'لم يبدأ الاختبار بعد', details: '' };
  
  if (url && key) {
    try {
      const supabase = await createClient();
      
      // Test 1: Try a simple query to a non-existent or dummy table
      // If we get ANY response from PostgREST (even a 404 or "relation not found"), 
      // it means the URL and Anon Key are valid and communicating!
      const { error: dbError } = await supabase.from('_status_check').select('*').limit(1);
      
      // Test 2: Check Auth API reachability without requiring a session
      const { error: authError } = await supabase.auth.getUser();

      // We consider it a success if we didn't get a network timeout or "Invalid API Key" error.
      // Even if data is null, getting a response from the server is a success.
      const isConfigValid = !authError || (authError.status !== 401 && authError.status !== 403);
      
      if (dbError && dbError.message.includes('fetch')) {
        authStatus = { 
          success: false, 
          message: 'فشل الاتصال بالشبكة', 
          details: 'تعذر الوصول إلى خوادم Supabase. تأكد من صحة العنوان (URL).' 
        };
      } else if (authError && (authError.message.includes('apiKey') || authError.status === 401)) {
        authStatus = { 
          success: false, 
          message: 'مفتاح API غير صالح', 
          details: 'المفتاح (Anon Key) المزود غير مقبول من قبل Supabase.' 
        };
      } else {
        authStatus = { 
          success: true, 
          message: 'تم التحقق من الربط بنجاح', 
          details: 'خوادم Supabase تستجيب بشكل صحيح للطلبات باستخدام الإعدادات الحالية.'
        };
      }
    } catch (e: any) {
      authStatus = { 
        success: false, 
        message: 'حدث خطأ استثنائي أثناء الاتصال', 
        details: e.message 
      };
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-right" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-6">
            <Database className="text-slate-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">تشخيص الاتصال المتقدم</h1>
          <p className="text-slate-400 font-medium">فحص حالة الربط من جهة المخدّم (Server-side)</p>
        </header>

        <div className="space-y-6">
          <div className={`p-8 rounded-[2rem] border-2 transition-all ${
            authStatus.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <div className="flex items-center gap-6 mb-4">
              {authStatus.success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              <div>
                <h2 className="text-2xl font-black">{authStatus.success ? 'الربط يعمل!' : 'فشل الربط'}</h2>
                <p className="font-bold opacity-80">{authStatus.message}</p>
              </div>
            </div>
            {authStatus.details && (
              <div className="bg-white/50 p-4 rounded-2xl mt-4 border border-current/10 font-mono text-sm break-all">
                {authStatus.details}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VariableCard 
              icon={<Globe size={20} />} 
              title="عنوان URL" 
              value={url || 'غير متوفر'} 
              healthy={!!url && url.startsWith('http')} 
            />
            <VariableCard 
              icon={<ShieldCheck size={20} />} 
              title="مفتاح API" 
              value={key ? 'تم ضبطه' : 'غير متوفر'} 
              healthy={!!key} 
            />
          </div>

          {!authStatus.success && (
            <div className="bg-indigo-50 p-8 rounded-[2rem] border-2 border-indigo-100">
              <h3 className="font-black text-indigo-800 mb-4 text-xl">كيفية الإصلاح:</h3>
              <ul className="space-y-3 text-indigo-700 font-medium">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-800 flex-shrink-0">1</span>
                  <span>اذهب إلى قائمة <b>Settings</b> ثم <b>Environment Variables</b> في AI Studio.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-800 flex-shrink-0">2</span>
                  <span>تأكد من إضافة <code>NEXT_PUBLIC_SUPABASE_URL</code> بشكل كامل (مع https://).</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-800 flex-shrink-0">3</span>
                  <span>تأكد من إضافة <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> الصحيح.</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-4">
             <Link 
              href="/"
              className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2 group"
            >
              العودة للرئيسية
              <ArrowRight size={20} className="group-hover:translate-x-[-4px] transition-transform" />
            </Link>
            
            <Link 
              href="/debug"
              className="py-4 px-8 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
            >
              تحديث
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariableCard({ icon, title, value, healthy }: any) {
  return (
    <div className="bg-white border-2 border-slate-100 p-6 rounded-[1.5rem] flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${healthy ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className={`font-bold text-sm break-all ${healthy ? 'text-slate-800' : 'text-red-500'}`}>{value}</p>
      </div>
    </div>
  );
}
