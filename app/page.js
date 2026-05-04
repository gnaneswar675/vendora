"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe, Star } from "lucide-react";
import { getProducts } from "@/lib/api";

function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      // Show only up to 4 products for trending
      setProducts(data.slice(0, 4));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card rounded-2xl h-80 animate-pulse border border-slate-700/50">
            <div className="h-48 bg-slate-800 rounded-t-2xl"></div>
            <div className="p-5 space-y-3">
              <div className="h-5 bg-slate-800 rounded w-3/4"></div>
              <div className="h-8 bg-slate-800 rounded w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400">No products available yet. Be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, i) => (
        <motion.div 
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="glass-card rounded-2xl overflow-hidden group border border-slate-700/50 flex flex-col"
        >
          <Link href={`/product/${product.id}`} className="block relative overflow-hidden h-48 bg-slate-800">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"
              }}
            />
          </Link>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/product/${product.id}`} className="font-bold text-lg hover:text-blue-400 transition-colors line-clamp-1">
                {product.title}
              </Link>
              <div className="flex items-center gap-1 text-yellow-400 text-sm shrink-0">
                <Star className="h-3 w-3 fill-current" /> {product.rating || 0}
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-blue-400 font-bold">${product.price}</p>
              <Link href={`/product/${product.id}`} className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 transition-colors text-xs font-medium text-white">
                View
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 container mx-auto text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Vendora v2.0 is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Marketplace of <br />
            <span className="text-gradient">Tomorrow</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Discover cutting-edge products, connect with visionary sellers, and experience the next generation of digital commerce.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2">
              Start Shopping <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/sign-up?role=vendor" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
              Become a Seller
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Vendora?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Engineered for speed, security, and a seamless user experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Built on Next.js for instant page loads and seamless navigation." },
              { icon: Shield, title: "Secure Transactions", desc: "Enterprise-grade encryption for all your payments and data." },
              { icon: Globe, title: "Global Reach", desc: "Connect with buyers and sellers from around the world instantly." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-colors group"
              >
                <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-24 container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trending Now</h2>
            <p className="text-slate-400">The most sought-after futuristic gear.</p>
          </div>
          <Link href="/shop" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 mt-4 md:mt-0">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <TrendingProducts />
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to join the future?</h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Whether you're looking for the next big thing or ready to sell your futuristic creations.
              </p>
              <Link href="/sign-up" className="inline-block px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors">
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
