'use server';

import { createClient } from '@/utils/supabase/server';
import { loginSchema, LoginInput } from '@/lib/validators/auth.schema';
import { redirect } from 'next/navigation';

export async function login(data: LoginInput) {
  const supabase = await createClient();

  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'بيانات غير صالحة' };
  }

  const { email, password } = validatedFields.data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }
    return { error: error.message };
  }

  // التحقق من حالة الحساب وتحديث وقت تسجيل الدخول
  if (authData.user) {
    const profile = await getCurrentProfile();
    
    if (profile && profile.status === 'disabled') {
      await supabase.auth.signOut();
      return { error: 'هذا الحساب معطل، يرجى الاتصال بالمسؤول للتفعيل.' };
    }

    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    let redirectUrl = '/dashboard';

    if (profile && profile.role !== 'admin') {
      const pages = ['dashboard', 'orders', 'inventory', 'production', 'customers', 'products', 'purchase-orders', 'settings'];
      for (const page of pages) {
        if (profile.permissions?.pages?.[page]) {
          redirectUrl = `/${page}`;
          break;
        }
      }
    }

    redirect(redirectUrl);
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  } catch (error) {
    console.error("Error getting current profile:", error);
    return null;
  }
}
