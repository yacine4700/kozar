import { OrderForm } from "@/components/order-system/OrderForm";
import { createAdminClient } from "@/utils/supabase/admin";

export default async function HomePage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main>
      <OrderForm products={products || []} />
    </main>
  );
}
