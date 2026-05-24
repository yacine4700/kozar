"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { CustomerInfo, ModelOrder, ColorOrder, AgeSize } from "@/types";
import { getCurrentProfile } from "@/actions/auth/auth.actions";
import { hasActionAccess } from "@/lib/permissions";

function normalizePhone(phone: string): string {
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '');
}

export async function submitWholesaleOrder(customerData: CustomerInfo, models: ModelOrder[]) {
  try {
    const profile = await getCurrentProfile();
    // Only restrict logged-in users (employees) who lack the permission.
    // Public customers (not logged in) should be allowed to submit orders.
    if (profile && !hasActionAccess(profile, 'orders.create')) {
      return { error: "ليس لديك صلاحية لإنشاء الطلبات." };
    }

    const supabase = createAdminClient();
    
    // 1. Normalize Phone
    const normalizedPhone = normalizePhone(customerData.whatsapp);
    if (!normalizedPhone) {
      return { error: "رقم الهاتف مطلوب وغير صالح." };
    }

    // 2. Auto-Detect / Create Customer
    let customerId: string;
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Optional: Update name and address
      await supabase
        .from('customers')
        .update({
          name: customerData.merchantName,
          address: customerData.state
        })
        .eq('id', customerId);
    } else {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          name: customerData.merchantName,
          phone: normalizedPhone,
          address: customerData.state
        })
        .select('id')
        .single();

      if (createError || !newCustomer) {
        console.error("Error creating customer:", createError);
        return { error: "حدث خطأ أثناء إنشاء بيانات العميل." };
      }
      customerId = newCustomer.id;
    }

    // 3. Create Order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'PENDING',
        total_amount: 0 // Prices are currently 0 in the form
      })
      .select('id')
      .single();

    if (orderError || !newOrder) {
      console.error("Error creating order:", orderError);
      return { error: "حدث خطأ أثناء إنشاء الطلب." };
    }

    // 4. Process Order Items
    const orderItemsToInsert: any[] = [];

    for (const model of models) {
      // Find product by id
      let { data: product } = await supabase
        .from('products')
        .select('id, price, sizes')
        .eq('id', model.productId)
        .single();

      if (!product) {
        console.error(`Product not found for id: ${model.productId}`);
        continue;
      }

      const hasSizes = product.sizes && product.sizes.length > 0;

      Object.entries(model.colorOrders).forEach(([colorName, order]) => {
        if (hasSizes) {
          product.sizes.forEach((age: string) => {
            const qty = Number(order.quantities[age]) || 0;
            if (qty > 0) {
              orderItemsToInsert.push({
                order_id: newOrder.id,
                product_id: product.id,
                quantity: qty,
                unit_price: product.price || 0,
                metadata: {
                  color: colorName === 'no-color' ? null : colorName,
                  size: age
                }
              });
            }
          });
        } else {
          const qty = Number(order.singleQuantity) || 0;
          if (qty > 0) {
            orderItemsToInsert.push({
              order_id: newOrder.id,
              product_id: product.id,
              quantity: qty,
              unit_price: product.price || 0,
              metadata: {
                color: colorName === 'no-color' ? null : colorName
              }
            });
          }
        }
      });
    }

    if (orderItemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        return { error: "حدث خطأ أثناء حفظ تفاصيل الطلب. يرجى التأكد من إضافة عمود metadata إلى جدول order_items." };
      }
    }

    return { success: true };

  } catch (error: any) {
    console.error("Submit order error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}
