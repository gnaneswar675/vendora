"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getOrderById } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  FileText,
  Clock,
  Box,
} from "lucide-react";

// Status definitions in order
const STATUS_STAGES = ["Processing", "Preparing", "Packed", "Departed", "Delivered"];

export default function OrderDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { role, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "buyer" || !user) {
      if (role !== "buyer") router.push("/sign-in");
      return;
    }

    getOrderById(id).then((data) => {
      // Security: Ensure the buyer is actually the owner of this order
      if (data && data.buyerId === user.uid) {
        setOrder(data);
      } else {
        setOrder(null);
      }
      setLoading(false);
    });
  }, [id, role, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 flex justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-4xl">
          <div className="h-8 bg-slate-800 rounded w-1/4 mb-10"></div>
          <div className="h-40 bg-slate-800 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-800 rounded-3xl"></div>
            <div className="h-64 bg-slate-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 text-center">
        <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order not found</h2>
        <p className="text-slate-400 mb-6">The order you are looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/orders" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  // Determine how far along the timeline this order is
  const currentStatusIndex = STATUS_STAGES.indexOf(order.status || "Processing");
  
  // Format the shipping address gracefully
  const formatAddress = () => {
    if (!order.shippingAddress) return "Standard Delivery Address\n(Address details not provided)";
    
    // If it's an object with fields
    if (typeof order.shippingAddress === 'object') {
      const { line1, city, postal_code, country, address, postalCode } = order.shippingAddress;
      const addr = line1 || address || "";
      const c = city || "";
      const zip = postal_code || postalCode || "";
      return `${addr}\n${c}, ${zip}\n${country || "US"}`.trim();
    }
    
    return String(order.shippingAddress);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Link>
            <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="px-4 py-2 rounded-xl border flex items-center gap-2 bg-slate-800/40 border-slate-700/50">
            {order.status === 'Delivered' ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-400" />
            )}
            <span className={`text-sm font-bold tracking-wide uppercase ${
              order.status === 'Delivered' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {order.status || 'Processing'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tracking Status Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3 glass-card rounded-3xl p-6 md:p-8 border border-slate-700/50"
          >
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-400" /> Tracking Status
            </h2>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full hidden sm:block"></div>
              
              <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-1000 hidden sm:block" 
                   style={{ width: `${Math.max(0, (currentStatusIndex / (STATUS_STAGES.length - 1)) * 100)}%` }}></div>
                   
              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                {STATUS_STAGES.map((stage, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div key={stage} className="relative flex sm:flex-col items-center gap-4 sm:gap-3 text-center z-10">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 transition-colors duration-500 ${
                        isCompleted ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {index === 0 && <Clock className="h-4 w-4" />}
                        {index === 1 && <Package className="h-4 w-4" />}
                        {index === 2 && <Box className="h-4 w-4" />}
                        {index === 3 && <Truck className="h-4 w-4" />}
                        {index === 4 && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div className="sm:absolute sm:top-12 sm:w-28 sm:-ml-14 sm:left-1/2 mt-2 sm:mt-0">
                        <p className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>{stage}</p>
                        {isCurrent && <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-wider font-bold">Current Step</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Items & Bill */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 glass-card rounded-3xl p-6 md:p-8 border border-slate-700/50"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" /> Order Summary
            </h2>
            
            <div className="space-y-6 mb-8 border-b border-slate-700/50 pb-8">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&q=80"} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-200 line-clamp-1">{item.title}</p>
                    <p className="text-slate-400 text-sm mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill / Totals */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-white">${(order.shipping || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span className="text-white">${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-700/50">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-blue-400">${(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Delivery Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 glass-card rounded-3xl p-6 md:p-8 border border-slate-700/50 self-start"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" /> Delivery
            </h2>
            
            <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
              <p className="font-bold text-white mb-2">{order.buyerName || user?.name || "Customer"}</p>
              <p className="text-slate-400 text-sm whitespace-pre-line leading-relaxed">
                {formatAddress()}
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Payment Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-400">Paid securely</span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
