"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!name) {
      return { error: "اسم التاجر مطلوب" };
    }

    // Normalize phone number if provided
    let normalizedPhone = phone;
    if (phone) {
      normalizedPhone = phone.replace(/\D/g, '');
    }

    const { error } = await supabase
      .from('customers')
      .update({
        name,
        phone: normalizedPhone,
        address
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating customer:", error);
      return { error: "حدث خطأ أثناء تحديث بيانات العميل" };
    }

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    console.error("Update customer exception:", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}
