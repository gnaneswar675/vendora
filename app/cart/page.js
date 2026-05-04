"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { motion } from 'framer-motion';
import { Trash2, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const { role } = useAuth();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Only allow buyers to see the cart
    if (role !== 'buyer') {
      router.push('/sign-in');
    }
  }, [role, router]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-slate-700/50">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center"
              >
                <div className="w-24 h-24 bg-slate-800 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block mb-1">{item.category}</span>
                  <Link href={`/product/${item.id}`} className="block font-bold text-lg hover:text-blue-400 transition-colors">
                    {item.title}
                  </Link>
                  <p className="text-slate-400 font-medium">${item.price}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center glass-card border border-slate-700 rounded-lg overflow-hidden h-10">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center hover:bg-slate-800 transition-colors">-</button>
                    <div className="w-10 h-full flex items-center justify-center font-bold text-sm border-x border-slate-700/50">{item.quantity}</div>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center hover:bg-slate-800 transition-colors">+</button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 rounded-2xl border border-slate-700/50 sticky top-24"
            >
              <h2 className="text-xl font-bold mb-6 pb-4 border-b border-slate-800">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping Estimate</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-white mb-8 pt-4 border-t border-slate-800">
                <span>Total</span>
                <span className="text-blue-400">${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2 mb-4 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4" /> Secure checkout powered by Stripe
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}