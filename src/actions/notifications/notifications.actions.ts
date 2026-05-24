"use server";

import { createClient } from '@/utils/supabase/server';

export interface AppNotification {
  id: string;
  created_at: string;
  title: string;
  message: string;
  is_read: boolean;
  reference_id: string | null;
  type: string;
}

export async function getUnreadNotifications(): Promise<{ data?: AppNotification[]; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: "حدث خطأ أثناء جلب الإشعارات" };
  }
}

export async function markAsRead(id: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error: "حدث خطأ" };
  }
}

export async function markAllAsRead() {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { error: "حدث خطأ" };
  }
}
