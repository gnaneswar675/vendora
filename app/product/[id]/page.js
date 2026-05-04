"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { getProductById, getProductReviews, addProductReview, getUserOrders } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, MessageSquare } from 'lucide-react';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { role, user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (params.id) {
      Promise.all([
        getProductById(params.id),
        getProductReviews(params.id)
      ]).then(([productData, reviewsData]) => {
        setProduct(productData);
        setReviews(reviewsData);
        setLoading(false);
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (user && role === 'buyer' && product) {
      getUserOrders(user.uid).then(orders => {
        const hasBought = orders.some(order => 
          order.items.some(item => item.id === product.id)
        );
        setUserHasPurchased(hasBought);
      });
    }
  }, [user, role, product]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setIsSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.name || "Anonymous Buyer",
        rating: reviewRating,
        text: reviewText,
      };
      await addProductReview(product.id, reviewData, product.rating, product.reviews);
      
      setReviews([{ ...reviewData, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...reviews]);
      setProduct({
        ...product,
        reviews: (product.reviews || 0) + 1,
        rating: Math.round((((product.rating || 0) * (product.reviews || 0)) + reviewRating) / ((product.reviews || 0) + 1) * 10) / 10
      });
      setReviewText("");
      setReviewRating(5);
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Failed to submit feedback.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-blue-400 hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <Link href="/shop" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-3xl overflow-hidden glass-card border border-slate-700/50 aspect-square lg:aspect-auto h-[400px] lg:h-[600px]"
        >
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"
            }}
          />
        </motion.div>

        {/* Product Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/20">
              {product.category}
            </span>
            {product.stock > 0 ? (
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/20">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/20">
                Out of Stock
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold">{product.rating}</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{product.reviews} Reviews</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Sold by <Link href="#" className="text-blue-400 hover:underline">{product.vendorName}</Link></span>
          </div>

          <div className="mb-8">
            <span className="text-4xl font-bold text-blue-400">${product.price}</span>
          </div>

          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center glass-card border border-slate-700 rounded-xl overflow-hidden h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center hover:bg-slate-800 text-xl transition-colors"
              >
                -
              </button>
              <div className="w-12 h-full flex items-center justify-center font-bold border-x border-slate-700/50">
                {quantity}
              </div>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-12 h-full flex items-center justify-center hover:bg-slate-800 text-xl transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            
            <button 
              onClick={() => {
                if (role !== 'buyer') {
                  router.push('/sign-in');
                } else {
                  addToCart(product, quantity);
                }
              }}
              className={`flex-1 h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                product.stock > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto">
            <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
              <ShieldCheck className="h-6 w-6 text-blue-400 mb-2" />
              <h4 className="font-semibold text-sm mb-1">1 Year Warranty</h4>
              <p className="text-xs text-slate-400">Full protection</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
              <Truck className="h-6 w-6 text-blue-400 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Fast Delivery</h4>
              <p className="text-xs text-slate-400">Within 24 hours</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
              <RotateCcw className="h-6 w-6 text-blue-400 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Free Returns</h4>
              <p className="text-xs text-slate-400">30-day policy</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-slate-800 pt-12">
        <h2 className="text-3xl font-bold mb-8">Customer Feedback</h2>
        
        {userHasPurchased && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50 mb-12"
          >
            <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setReviewRating(star)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl border ${reviewRating >= star ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-700 bg-slate-800/50 text-slate-500'} transition-colors`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Your Feedback</label>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think of this product?" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none min-h-[100px]"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingReview}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </motion.div>
        )}

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl border border-slate-700/50">
              <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No feedback yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            reviews.map((review, i) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl border border-slate-700/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-white">{review.userName}</h4>
                    <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300">{review.text}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
