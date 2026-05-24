"use server";

import { createClient } from '@/utils/supabase/server';

export interface DemandVariant {
  color: string;
  size: string;
  pending_order_quantity: number;
  current_stock: number;
  needed_quantity: number;
}

export interface ProductionDemand {
  productId: string;
  productName: string;
  totalOrdered: number;
  totalStock: number;
  totalNeeded: number;
  variants: DemandVariant[];
}

export async function getProductionDemand(): Promise<{ data?: ProductionDemand[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: viewData, error } = await supabase
      .from('production_demand_view')
      .select('*');

    if (error) {
      console.error("Error fetching production demand view:", error);
      return { error: "حدث خطأ أثناء جلب خطة الإنتاج" };
    }

    if (!viewData) {
      return { data: [] };
    }

    // Transform flat view data into hierarchical structure
    const demandMap = new Map<string, ProductionDemand>();

    viewData.forEach(row => {
      const pId = row.product_id;
      if (!demandMap.has(pId)) {
        demandMap.set(pId, {
          productId: pId,
          productName: row.product_name || 'غير معروف',
          totalOrdered: 0,
          totalStock: 0,
          totalNeeded: 0,
          variants: []
        });
      }

      const productEntry = demandMap.get(pId)!;
      
      const pendingQty = Number(row.pending_order_quantity) || 0;
      const stockQty = Number(row.current_stock) || 0;
      const neededQty = Number(row.needed_quantity) || 0;

      productEntry.totalOrdered += pendingQty;
      productEntry.totalStock += stockQty;
      productEntry.totalNeeded += neededQty > 0 ? neededQty : 0;

      productEntry.variants.push({
        color: row.color || 'بدون لون',
        size: row.size || 'بدون مقاس',
        pending_order_quantity: pendingQty,
        current_stock: stockQty,
        needed_quantity: neededQty
      });
    });

    return { data: Array.from(demandMap.values()) };
  } catch (error: any) {
    console.error("getProductionDemand error:", error);
    return { error: "حدث خطأ غير متوقع." };
  }
}
