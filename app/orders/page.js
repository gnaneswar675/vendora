"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getUserOrders } from '@/lib/api';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Orders() {
  const router = useRouter();
  const { role, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'buyer' || !user) {
      if (role !== 'buyer') router.push('/sign-in');
      return;
    }
    
    getUserOrders(user.uid).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [role, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
          <div className="h-10 bg-slate-800 rounded w-1/4 mb-8"></div>
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-slate-400 mb-8">Track, return, or buy items again.</p>

        {orders.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border border-slate-700/50">
            <Package className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-slate-400 mb-6">When you buy something, it will show up here.</p>
            <Link href="/shop" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl border border-slate-700/50 overflow-hidden"
              >
                <div className="bg-slate-800/50 p-4 md:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/50 text-sm">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-slate-400 mb-1">Order Placed</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Total</p>
                      <p className="font-medium text-blue-400">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-slate-400 mb-1">Order # {order.id}</p>
                    <Link href={`/orders/${order.id}`} className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                      View details <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-6">
                    {order.status === 'Delivered' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                    <span className={`font-bold ${order.status === 'Delivered' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden shrink-0">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&q=80"} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1">
                          <Link href={`/product/${item.id}`} className="font-bold text-lg hover:text-blue-400 transition-colors line-clamp-1">
                            {item.title}
                          </Link>
                          <p className="text-slate-400 text-sm mb-2">Qty: {item.quantity}</p>
                          <div className="flex gap-3 mt-4">
                            <Link href={`/product/${item.id}`} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                              Leave Feedback
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
