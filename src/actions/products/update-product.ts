"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AddProductParams } from "./add-product";

export async function updateProduct(id: string, params: AddProductParams) {
  try {
    const supabase = await createClient();

    const { name, description = '', price = 0, colors = [], sizes = [] } = params;

    if (!name.trim()) {
      return { error: "Product name is required" };
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        description: description.trim(),
        price,
        colors,
        sizes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return { error: "Failed to update product: " + error.message };
    }

    revalidatePath("/products");
    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action error:", err);
    return { error: "An unexpected error occurred" };
  }
}
