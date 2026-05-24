"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteCustomer(id: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting customer:", error);
      
      // Handle foreign key constraint error specifically
      if (error.code === '23503') {
         return { error: "لا يمكن حذف هذا العميل لوجود طلبات مرتبطة به." };
      }
      
      return { error: "حدث خطأ أثناء حذف العميل" };
    }

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    console.error("Delete customer exception:", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}
