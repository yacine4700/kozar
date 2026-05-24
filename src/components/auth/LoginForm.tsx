'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validators/auth.schema';
import { login } from '@/actions/auth/auth.actions';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    setIsPending(true);
    
    const promise = login(data);
    
    promise.then((result) => {
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      } else {
        // This case shouldn't normally be reached if redirect works,
        // but it prevents infinite loading if it does.
        setIsPending(false);
      }
    }).catch((e) => {
      // Check if it's a redirect error from Next.js (it often has a digest property or specific message)
      if (e && (e.digest?.includes('NEXT_REDIRECT') || e.message?.includes('NEXT_REDIRECT'))) {
        return;
      }
      setIsPending(false);
      setError('حدث خطأ غير متوقع');
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-sm border border-indigo-100">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">دخول المسؤولين</h1>
        <p className="text-slate-400 font-medium">لوحة التحكم في متجر زهرة الربيع</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-black flex items-center gap-3">
             <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
             {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">
            البريد الإلكتروني
          </label>
          <div className="relative group">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Mail size={20} />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@example.com"
              className={cn(
                "w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 pr-14 font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300",
                errors.email && "border-red-200 focus:border-red-500"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs font-bold mr-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">
            كلمة المرور
          </label>
          <div className="relative group">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={20} />
            </div>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={cn(
                "w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 pr-14 font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300",
                errors.password && "border-red-200 focus:border-red-500"
              )}
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs font-bold mr-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 text-lg disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              جاري تسجيل الدخول...
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </form>
    </div>
  );
};
