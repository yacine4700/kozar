"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface AddProductParams {
  name: string;
  description?: string;
  price?: number;
  colors?: string[];
  sizes?: string[];
}

// Generates an SKU like PRD-4A9B2
function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PRD-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function addProduct(params: AddProductParams) {
  try {
    const supabase = await createClient();

    const { name, description = '', price = 0, colors = [], sizes = [] } = params;

    if (!name.trim()) {
      return { error: "Product name is required" };
    }

    const sku = generateSKU();

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        description: description.trim(),
        sku,
        price,
        colors,
        sizes
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { error: "Failed to add product: " + error.message };
    }

    revalidatePath("/products");
    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action error:", err);
    return { error: "An unexpected error occurred" };
  }
}
