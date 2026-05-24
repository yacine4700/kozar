"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface DeliveryInputItem {
  order_item_id: string;
  quantity: number;
  unit_price: number;
}

export async function createDelivery(orderId: string, items: DeliveryInputItem[], notes?: string) {
  try {
    const supabase = await createClient();

    // 1. Fetch current order items to validate remaining quantities
    const { data: orderItems, error: fetchError } = await supabase
      .from('order_items')
      .select('id, quantity, fulfilled_quantity, product_id')
      .eq('order_id', orderId);

    if (fetchError || !orderItems) {
      console.error("Error fetching order items:", fetchError);
      return { error: "حدث خطأ أثناء جلب تفاصيل الطلب" };
    }

    // Filter out items with 0 delivery quantity
    const validItems = items.filter(i => i.quantity > 0);
    if (validItems.length === 0) {
      return { error: "يجب تحديد كمية لمنتج واحد على الأقل" };
    }

    // Validate quantities
    for (const item of validItems) {
      const orderItem = orderItems.find(oi => oi.id === item.order_item_id);
      if (!orderItem) {
         return { error: "عنصر الطلب غير موجود" };
      }
      const remaining = orderItem.quantity - orderItem.fulfilled_quantity;
      if (item.quantity > remaining) {
         return { error: `الكمية المدخلة تتجاوز الكمية المتبقية لأحد المنتجات` };
      }
    }

    // 2. Create the delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert({ order_id: orderId, notes })
      .select('id')
      .single();

    if (deliveryError || !delivery) {
      console.error("Error creating delivery:", deliveryError);
      return { error: "حدث خطأ أثناء إنشاء وصل التوصيل" };
    }

    // 3. Create delivery items, update order items, and deduct stock
    for (const item of validItems) {
      // Insert delivery item
      const { error: diError } = await supabase
        .from('delivery_items')
        .insert({
          delivery_id: delivery.id,
          order_item_id: item.order_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        });
      
      if (diError) {
        console.error("Error creating delivery item:", diError);
        continue;
      }

      // Update order_item fulfilled quantity
      const orderItem = orderItems.find(oi => oi.id === item.order_item_id)!;
      const newFulfilled = orderItem.fulfilled_quantity + item.quantity;
      
      await supabase
        .from('order_items')
        .update({ fulfilled_quantity: newFulfilled })
        .eq('id', item.order_item_id);
        
      // Update our local reference for the status check below
      orderItem.fulfilled_quantity = newFulfilled;

      // Deduct from Inventory (Variant Level)
      // orderItems need color and size from metadata, which we need to fetch
      const { data: fullOrderItem } = await supabase
        .from('order_items')
        .select('metadata')
        .eq('id', orderItem.id)
        .single();
        
      const color = fullOrderItem?.metadata?.color || 'بدون لون';
      const size = fullOrderItem?.metadata?.size || 'بدون مقاس';

      const { data: variant } = await supabase
        .from('product_variants')
        .select('id, stock_quantity')
        .eq('product_id', orderItem.product_id)
        .eq('color', color)
        .eq('size', size)
        .single();
        
      if (variant) {
        const currentStock = variant.stock_quantity || 0;
        const newStock = currentStock - item.quantity; 
        
        await supabase
          .from('product_variants')
          .update({ 
            stock_quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', variant.id);
      } else {
        // If variant doesn't exist, we create it with negative stock as an audit
        await supabase
          .from('product_variants')
          .insert({
            product_id: orderItem.product_id,
            color,
            size,
            stock_quantity: -item.quantity
          });
      }
          
      // Log the movement with variant details
      await supabase
        .from('stock_movements')
        .insert({
          product_id: orderItem.product_id,
          color,
          size,
          type: 'OUT',
          quantity: item.quantity,
          reason: 'ORDER',
          order_id: orderId
        });
    }

    // 4. Recalculate order status
    const isCompleted = orderItems.every(oi => oi.fulfilled_quantity >= oi.quantity);
    const newStatus = isCompleted ? 'COMPLETED' : 'PARTIALLY_FULFILLED';

    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateOrderError) {
       console.error("Error updating order status:", updateOrderError);
    }

    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error("Create delivery exception:", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}
