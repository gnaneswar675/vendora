import { supabase } from '../supabase/client';
import { Product } from './products';

export async function getWishlist(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      products (
        *,
        users (
          name
        )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching wishlist for user ${userId}:`, error);
    return [];
  }

  // Extract nested product records
  return (data || [])
    .map((row: any) => row.products)
    .filter(Boolean)
    .map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      image: product.image_url,
      vendorId: product.vendor_id,
      vendorName: product.users?.name || 'Unknown Vendor',
      rating: Number(product.rating || 0),
      reviews: Number(product.reviews_count || 0),
      createdAt: product.created_at,
    }));
}

export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('wishlists')
    .insert({
      user_id: userId,
      product_id: productId,
    });

  if (error) {
    console.error(`Error adding product ${productId} to wishlist for user ${userId}:`, error);
    throw error;
  }

  return true;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error(`Error removing product ${productId} from wishlist for user ${userId}:`, error);
    throw error;
  }

  return true;
}
