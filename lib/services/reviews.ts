import { supabase } from '../supabase/client';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: text;
  createdAt: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users (
        name
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.users?.name || 'Unknown Buyer',
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at,
  }));
}

export async function addProductReview(
  productId: string, 
  reviewData: { userId: string; rating: number; comment: string },
  currentRating: number,
  currentReviews: number
): Promise<boolean> {
  // 1. Insert review into Supabase
  const { error: reviewError } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: reviewData.userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });

  if (reviewError) {
    console.error('Error inserting product review:', reviewError);
    throw reviewError;
  }

  // 2. Calculate new aggregate rating and reviews count
  const newReviewsCount = (currentReviews || 0) + 1;
  const newRating = (((currentRating || 0) * (currentReviews || 0)) + reviewData.rating) / newReviewsCount;
  const roundedRating = Math.round(newRating * 10) / 10;

  // 3. Update the product record
  const { error: productError } = await supabase
    .from('products')
    .update({
      rating: roundedRating,
      reviews_count: newReviewsCount,
    })
    .eq('id', productId);

  if (productError) {
    console.error('Error updating product rating stats:', productError);
    // Log error but don't fail the operation as the review was successfully added
  }

  return true;
}
