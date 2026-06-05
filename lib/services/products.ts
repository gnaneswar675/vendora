import { supabase } from '../supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  vendorId: string;
  vendorName: string;
  rating: number;
  reviews: number;
  createdAt?: string;
}

// Map database row to frontend format
function mapProductRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    image: row.image_url,
    vendorId: row.vendor_id,
    vendorName: row.users?.name || 'Unknown Vendor',
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews_count || 0),
    createdAt: row.created_at,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, users(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    return [];
  }

  return (data || []).map(mapProductRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, users(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id} from Supabase:`, error);
    return null;
  }

  return data ? mapProductRow(data) : null;
}

export async function addProduct(productData: Partial<Product>): Promise<string> {
  const dbData = {
    title: productData.title,
    description: productData.description,
    category: productData.category,
    price: productData.price,
    stock: productData.stock,
    image_url: productData.image,
    vendor_id: productData.vendorId,
    rating: productData.rating || 0,
    reviews_count: productData.reviews || 0,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(dbData)
    .select('id')
    .single();

  if (error) {
    console.error('Error adding product to Supabase:', error);
    throw error;
  }

  return data.id;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
  const dbData: any = {};
  if (productData.title !== undefined) dbData.title = productData.title;
  if (productData.description !== undefined) dbData.description = productData.description;
  if (productData.category !== undefined) dbData.category = productData.category;
  if (productData.price !== undefined) dbData.price = productData.price;
  if (productData.stock !== undefined) dbData.stock = productData.stock;
  if (productData.image !== undefined) dbData.image_url = productData.image;
  if (productData.rating !== undefined) dbData.rating = productData.rating;
  if (productData.reviews !== undefined) dbData.reviews_count = productData.reviews;

  const { error } = await supabase
    .from('products')
    .update(dbData)
    .eq('id', id);

  if (error) {
    console.error(`Error updating product ${id} in Supabase:`, error);
    throw error;
  }

  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product ${id} from Supabase:`, error);
    throw error;
  }

  return true;
}

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, users(name)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching vendor products for ${vendorId}:`, error);
    return [];
  }

  return (data || []).map(mapProductRow);
}
