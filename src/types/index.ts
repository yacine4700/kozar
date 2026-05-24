export type AgeSize = string; // Now dynamic based on the product sizes

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock_quantity: number;
  colors: string[];
  sizes: string[];
  created_at: string;
}

export interface ColorOrder {
  singleQuantity: number | string;
  quantities: Record<AgeSize, number | string>;
}

export interface ModelOrder {
  productId: string;
  modelName: string;
  selected: boolean;
  /**
   * Key: Color name (e.g., 'عنابي') or 'no-color' if the product doesn't support colors.
   */
  colorOrders: Record<string, ColorOrder>;
}

export interface CustomerInfo {
  merchantName: string;
  whatsapp: string;
  state: string;
}

export type OrderStatus = 'PENDING' | 'PARTIALLY_FULFILLED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  fulfilled_quantity: number;
  unit_price: number;
  metadata: {
    color?: string | null;
    size?: string | null;
  };
  created_at: string;
  products?: Product; // for joined queries
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  customers?: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  order_items?: OrderItem[];
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  order_item_id: string;
  quantity: number;
  unit_price: number;
}

export interface Delivery {
  id: string;
  order_id: string;
  created_at: string;
  notes?: string;
  delivery_items?: DeliveryItem[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  stock_quantity: number;
  updated_at: string;
  products?: Product;
}

export interface StockMovement {
  id: string;
  product_id: string;
  color?: string;
  size?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: 'PRODUCTION' | 'ORDER' | 'MANUAL_ADJUSTMENT';
  order_id?: string;
  created_at: string;
}
