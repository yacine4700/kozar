"use server";

import { createClient } from '@/utils/supabase/server';

export interface DashboardStats {
  pendingOrdersCount: number;
  customersCount: number;
  productsCount: number;
  recentOrders: any[];
}

export async function getDashboardStats(): Promise<{ data?: DashboardStats; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Get Pending Orders Count
    const { count: pendingOrdersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    if (ordersError) throw ordersError;

    // 2. Get Customers Count
    const { count: customersCount, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (customersError) throw customersError;

    // 3. Get Products Count
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    // 4. Get Recent Orders (Latest 5)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        customers (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) throw recentOrdersError;

    return {
      data: {
        pendingOrdersCount: pendingOrdersCount || 0,
        customersCount: customersCount || 0,
        productsCount: productsCount || 0,
        recentOrders: recentOrders || [],
      }
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return { error: "حدث خطأ أثناء جلب بيانات لوحة القيادة." };
  }
}
