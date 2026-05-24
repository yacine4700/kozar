"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteOrder(id: string) {
  try {
    const supabase = await createClient();
    
    // Check if the order has any deliveries before deleting
    const { data: deliveries, error: checkError } = await supabase
      .from('deliveries')
      .select('id')
      .eq('order_id', id)
      .limit(1);

    if (checkError) {
       console.error("Error checking deliveries for order:", checkError);
       return { error: "حدث خطأ أثناء التحقق من الطلب" };
    }

    if (deliveries && deliveries.length > 0) {
      return { error: "لا يمكن حذف طلب يحتوي على توصيلات منجزة. قم بحذف وصل التوصيل أولاً." };
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting order:", error);
      return { error: "حدث خطأ أثناء حذف الطلب" };
    }

    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error("Delete order exception:", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}
