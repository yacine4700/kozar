"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string | null;
  role: string;
  status: string;
  last_login: string | null;
  permissions?: any;
}

export async function getUsers(): Promise<{ data?: UserProfile[]; error?: string }> {
  try {
    const supabase = await createClient();
    
    // We fetch from profiles. If we also need email, we might need to join auth.users using admin client
    // Or we assume email is stored in profiles or fetched via admin client
    const supabaseAdmin = createAdminClient();
    
    // Fetch profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return { error: "حدث خطأ أثناء جلب المستخدمين" };
    }

    // Fetch auth users to get emails
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching auth users:", authError);
      return { error: "حدث خطأ أثناء جلب بيانات المصادقة" };
    }

    const mergedData = profiles.map(profile => {
      const authUser = users.find(u => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || '',
      };
    });

    return { data: mergedData };
  } catch (error) {
    console.error("getUsers error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function createUser(data: { email: string; password?: string; full_name: string; role: string; permissions?: any }) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password || 'password123', // default password if not provided
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return { error: "حدث خطأ أثناء إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً بالفعل." };
    }

    if (authData.user) {
      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          full_name: data.full_name,
          role: data.role,
          status: 'active',
          permissions: data.permissions || {}
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return { error: "تم إنشاء الحساب ولكن حدث خطأ أثناء حفظ التفاصيل." };
      }
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("createUser error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function updateUserStatus(userId: string, newStatus: string) {
  try {
    const supabaseAdmin = createAdminClient();
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) {
      console.error("Error updating user status:", error);
      return { error: "حدث خطأ أثناء تحديث حالة المستخدم." };
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("updateUserStatus error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Delete from auth.users (this cascades to profiles if foreign key is set up correctly, otherwise delete profile too)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error);
      return { error: "حدث خطأ أثناء حذف المستخدم." };
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("deleteUser error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function updateUser(userId: string, data: { full_name?: string; role?: string; status?: string; permissions?: any }) {
  try {
    const supabaseAdmin = createAdminClient();
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) {
      console.error("Error updating user:", error);
      return { error: "حدث خطأ أثناء تحديث بيانات المستخدم." };
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("updateUser error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}
