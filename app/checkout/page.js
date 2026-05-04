"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { createOrder } from '@/lib/api';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, CheckCircle2, Lock } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { role, user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 15.00 : 0;
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (role !== 'buyer') {
      router.push('/sign-in');
    }
  }, [role, router]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderData = {
        buyerId: user.uid,
        buyerName: user.name || "Alex Buyer",
        items: cartItems,
        total: total,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        status: "processing",
      };
      
      await createOrder(orderData);
      
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push('/orders');
      }, 2000);
    } catch (error) {
      console.error("Failed to create order:", error);
      setIsProcessing(false);
      alert("Checkout failed. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4 relative z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 rounded-3xl text-center max-w-md w-full border border-green-500/30"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-slate-400 mb-8">Your order has been placed and is being processed.</p>
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 mt-4">Redirecting to your orders...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Shipping Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">First Name</label>
                <input type="text" defaultValue="Alex" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                <input type="text" defaultValue="Buyer" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Address</label>
                <input type="text" defaultValue="123 Future Lane, Apt 4B" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">City</label>
                <input type="text" defaultValue="Neo-Tokyo" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Postal Code</label>
                <input type="text" defaultValue="90210" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none" />
              </div>
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>

            <form id="payment-form" onSubmit={handleCheckout} className="space-y-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Card Information</label>
                <div className="relative">
                  <input type="text" placeholder="Card number" className="w-full bg-slate-900/50 border border-slate-700 rounded-t-xl py-3 px-4 text-white focus:border-blue-500 outline-none" />
                  <div className="absolute right-3 top-3 text-slate-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex border-x border-b border-slate-700 rounded-b-xl overflow-hidden">
                  <input type="text" placeholder="MM / YY" className="w-1/2 bg-slate-900/50 border-r border-slate-700 py-3 px-4 text-white focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="CVC" className="w-1/2 bg-slate-900/50 py-3 px-4 text-white focus:border-blue-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name on card</label>
                <input type="text" defaultValue="Alex Buyer" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none" />
              </div>
            </form>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-3xl border border-slate-700/50 sticky top-24"
          >
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-slate-800">Order Summary</h2>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-slate-800">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-white">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold text-white mb-8 pt-4 border-t border-slate-800">
              <span>Total</span>
              <span className="text-blue-400">${total.toFixed(2)}</span>
            </div>

            <button 
              form="payment-form"
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2 mb-4"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" /> Pay ${total.toFixed(2)}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
