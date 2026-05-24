"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase delete error:", error);
      return { error: "Failed to delete product: " + error.message };
    }

    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    console.error("Server Action error:", err);
    return { error: "An unexpected error occurred" };
  }
}
