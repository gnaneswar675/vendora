import { supabase } from '../supabase/client';

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  vendorId?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingAddress: string;
  status: string;
  createdAt: string;
  date?: string; // Compatibility field
  items: OrderItem[];
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  // 1. Insert order into the orders table
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: orderData.buyerId,
      buyer_name: orderData.buyerName,
      total: orderData.total,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping: orderData.shipping,
      shipping_address: orderData.shippingAddress || 'Standard Shipping Address',
      status: orderData.status.toLowerCase(),
    })
    .select('id')
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order in Supabase:', orderError);
    throw orderError || new Error('Failed to create order');
  }

  const orderId = newOrder.id;

  // 2. Insert items into order_items table
  const itemsToInsert = orderData.items.map(item => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error saving order items in Supabase:', itemsError);
    throw itemsError;
  }

  // 3. Update product stock quantities (reduce stock)
  for (const item of orderData.items) {
    // Fetch current product stock
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single();

    if (product) {
      const currentStock = Number(product.stock || 0);
      const newStock = Math.max(0, currentStock - item.quantity);

      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);
    }
  }

  return orderId;
}

// Maps database join query rows to Order objects
function reconstructOrders(dbOrders: any[]): Order[] {
  return (dbOrders || []).map(order => {
    const items: OrderItem[] = (order.order_items || []).map((oi: any) => ({
      id: oi.product_id || '',
      title: oi.products?.title || 'Unknown Product',
      price: Number(oi.price),
      quantity: Number(oi.quantity),
      image: oi.products?.image_url || '',
      vendorId: oi.products?.vendor_id || '',
    }));

    return {
      id: order.id,
      buyerId: order.buyer_id,
      buyerName: order.buyer_name,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      shippingAddress: order.shipping_address,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize
      createdAt: order.created_at,
      date: order.created_at, // For compatibility
      items,
    };
  });
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        product_id,
        quantity,
        price,
        products (
          title,
          image_url,
          vendor_id
        )
      )
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return [];
  }

  return reconstructOrders(data || []);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        product_id,
        quantity,
        price,
        products (
          title,
          image_url,
          vendor_id
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return null;
  }

  const orders = reconstructOrders([data]);
  return orders[0] || null;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        product_id,
        quantity,
        price,
        products (
          title,
          image_url,
          vendor_id
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }

  return reconstructOrders(data || []);
}

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus.toLowerCase() })
    .eq('id', orderId);

  if (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }

  return true;
}

export async function getVendorOrders(vendorId: string): Promise<Order[]> {
  // To avoid complex outer join filters, we do a two-step query
  // 1. Fetch order items for products belonging to this vendor
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      order_id,
      product_id,
      quantity,
      price,
      products!inner (
        title,
        image_url,
        vendor_id
      )
    `)
    .eq('products.vendor_id', vendorId);

  if (itemsError || !orderItems || orderItems.length === 0) {
    return [];
  }

  // Extract unique order IDs
  const orderIds = Array.from(new Set(orderItems.map(item => item.order_id)));

  // 2. Fetch the orders corresponding to those IDs
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        product_id,
        quantity,
        price,
        products (
          title,
          image_url,
          vendor_id
        )
      )
    `)
    .in('id', orderIds)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error fetching vendor orders:', ordersError);
    return [];
  }

  return reconstructOrders(orders || []);
}

export async function getVendorStats(vendorId: string): Promise<any> {
  try {
    // 1. Fetch products count and aggregate rating
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('rating, reviews_count')
      .eq('vendor_id', vendorId);

    const totalProducts = products?.length || 0;
    const avgRating = totalProducts > 0 
      ? products!.reduce((acc, p) => acc + Number(p.rating || 0), 0) / totalProducts 
      : 0;

    // 2. Fetch vendor orders
    const vendorOrders = await getVendorOrders(vendorId);

    // 3. Calculate revenue and active orders
    let totalRevenue = 0;
    let activeOrdersCount = 0;

    for (const order of vendorOrders) {
      // Find items belonging to this vendor
      const vendorItems = order.items.filter(item => item.vendorId === vendorId);
      const orderRevenue = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalRevenue += orderRevenue;

      if (order.status !== 'Delivered') {
        activeOrdersCount++;
      }
    }

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeOrders: activeOrdersCount,
      totalOrders: vendorOrders.length,
      totalProducts,
      rating: avgRating.toFixed(1),
      revenueData: [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: Number((totalRevenue * 0.2).toFixed(2)) },
        { name: 'Mar', value: Number((totalRevenue * 0.5).toFixed(2)) },
        { name: 'Apr', value: Number((totalRevenue * 0.8).toFixed(2)) },
        { name: 'May', value: Number(totalRevenue.toFixed(2)) },
      ],
      recentOrders: vendorOrders.slice(0, 5)
    };
  } catch (error) {
    console.error('Error calculating vendor stats:', error);
    return {
      totalRevenue: 0,
      activeOrders: 0,
      totalOrders: 0,
      totalProducts: 0,
      rating: '0.0',
      revenueData: [],
      recentOrders: []
    };
  }
}
