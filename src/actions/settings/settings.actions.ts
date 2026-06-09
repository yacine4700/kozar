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
    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    // Query using admin client to bypass RLS which blocks standard clients from reading/writing.
    // Order by created_at ascending to get the FIRST (original) settings row.
    const { data, error } = await adminSupabase
      .from('settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return { error: "حدث خطأ أثناء جلب الإعدادات" };
    }

    if (!data) {
      // Create a default settings record if none exists.
      const { data: newData, error: insertError } = await adminSupabase
        .from('settings')
        .insert({})
        .select('*')
        .single();
        
      if (insertError) {
        console.error("Error creating default settings:", insertError);
        return { error: `Failed to create settings row: ${insertError.message}` };
      }
      
      return { data: newData };
    }

    // Clean up duplicate rows if they exist (fixes the spam row bug)
    const { data: allSettings } = await adminSupabase.from('settings').select('id').order('created_at', { ascending: true });
    if (allSettings && allSettings.length > 1) {
       const idsToDelete = allSettings.slice(1).map(s => s.id);
       await adminSupabase.from('settings').delete().in('id', idsToDelete);
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
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "غير مصرح لك بتعديل الإعدادات" };
    }

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    // UPDATE the single record using admin client to bypass RLS
    const { error } = await adminSupabase
      .from('settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error updating settings:", error);
      return { error: "حدث خطأ أثناء حفظ الإعدادات" };
    }

    revalidatePath('/settings', 'layout');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("updateSettings error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}
