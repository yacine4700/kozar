"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface WorkshopSettings {
  id: string;
  workshop_name: string | null;
  workshop_address: string | null;
  rc: string | null;
  nif: string | null;
  ai: string | null;
  nis: string | null;
}

export async function getSettings(): Promise<{ data?: WorkshopSettings | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return { error: "حدث خطأ أثناء جلب الإعدادات" };
    }

    return { data };
  } catch (error) {
    console.error("getSettings error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}

export async function updateSettings(id: string, updates: Partial<WorkshopSettings>): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated (can add role check here later)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "غير مصرح لك بتعديل الإعدادات" };
    }

    const { error } = await supabase
      .from('settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error updating settings:", error);
      return { error: "حدث خطأ أثناء حفظ الإعدادات" };
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("updateSettings error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}
