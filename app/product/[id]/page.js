"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { getProductById } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { role } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      getProductById(params.id).then(data => {
        setProduct(data);
        setLoading(false);
      });
    }
  }, [params.id]);

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
    </div>
  );
}
