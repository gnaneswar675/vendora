// Supabase API Adapter
// Re-exports service layer functions to maintain backward compatibility with client UI files.

export { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getVendorProducts 
} from './services/products';

export { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  getOrders, 
  updateOrderStatus, 
  getVendorOrders, 
  getVendorStats 
} from './services/orders';

export { 
  getProductReviews, 
  addProductReview 
} from './services/reviews';

export { 
  getUsers 
} from './services/auth';

export { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from './services/wishlist';

export { 
  uploadProductImage 
} from './services/upload';
