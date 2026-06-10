import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get purchase_orders
    const { data: po, error: poErr } = await supabase.from('purchase_orders').select('*').limit(1);
    
    // Get purchase_order_items
    const { data: poi, error: poiErr } = await supabase.from('purchase_order_items').select('*').limit(1);
    
    // Get inventory_transactions
    const { data: inv, error: invErr } = await supabase.from('inventory_transactions').select('*').limit(1);
    
    // Try to trigger constraint errors to see actual columns
    const { error: insertPoErr } = await supabase.from('purchase_orders').insert({ BAD_COL: 1 });
    const { error: insertPoiErr } = await supabase.from('purchase_order_items').insert({ BAD_COL: 1 });
    const { error: insertInvErr } = await supabase.from('inventory_transactions').insert({ BAD_COL: 1 });
    
    return NextResponse.json({
      po, poErr,
      poi, poiErr,
      inv, invErr,
      insertPoErr,
      insertPoiErr,
      insertInvErr
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
