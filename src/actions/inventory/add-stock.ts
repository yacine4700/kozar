"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addStock(
  productId: string, 
  color: string, 
  size: string, 
  quantity: number, 
  action: 'ADD' | 'REMOVE',
  reason: 'PRODUCTION' | 'ORDER' | 'MANUAL_ADJUSTMENT' = 'MANUAL_ADJUSTMENT'
) {
  if (quantity <= 0) return { error: "الكمية يجب أن تكون أكبر من الصفر" };

  try {
    const supabase = await createClient();

    // 1. Get or create variant
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .eq('product_id', productId)
      .eq('color', color)
      .eq('size', size)
      .single();

    const currentStock = variant ? (variant.stock_quantity || 0) : 0;
    
    // Validation for REMOVE
    if (action === 'REMOVE' && currentStock < quantity) {
      return { error: "لا يمكن سحب كمية أكبر من المخزون المتوفر" };
    }

    const newStock = action === 'ADD' ? currentStock + quantity : currentStock - quantity;

    if (variant) {
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ 
          stock_quantity: newStock, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', variant.id);

      if (updateError) {
        console.error('Update Variant Error:', updateError);
        return { error: "فشل تحديث كمية المخزون" };
      }
    } else {
      if (action === 'REMOVE') {
        // Just in case they somehow try to remove from a non-existent variant that bypassed validation
        return { error: "لا يوجد مخزون متوفر لهذا المتغير" };
      }

      const { error: insertError } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          color,
          size,
          stock_quantity: newStock
        });

      if (insertError) {
        console.error('Insert Variant Error:', insertError);
        return { error: "فشل إنشاء المتغير الجديد للمخزون" };
      }
    }

    // 2. Insert Stock Movement
    const { error: moveError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        color,
        size,
        type: action === 'ADD' ? 'IN' : 'OUT',
        quantity: quantity,
        reason: reason
      });

    if (moveError) {
      console.error('Insert Movement Error:', moveError);
      return { error: "فشل تسجيل حركة المخزون" };
    }

    revalidatePath('/inventory');
    return { success: true };
  } catch (err: any) {
    console.error('Add Stock Error:', err);
    return { error: "حدث خطأ غير متوقع" };
  }
}
