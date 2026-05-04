"use client";
import { useState, useEffect } from 'react';
import { getVendorProducts } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, MoreVertical, Star } from 'lucide-react';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      getVendorProducts(user.uid).then(data => {
        setProducts(data);
        setLoading(false);
      });
    } else if (user === null) {
      // Not logged in or not loaded yet
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between">
            <div className="h-10 bg-slate-800 rounded w-1/4"></div>
            <div className="h-10 bg-slate-800 rounded w-32"></div>
          </div>
          <div className="h-96 bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Products</h1>
          <p className="text-slate-400">Manage your store's inventory.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <Link href="/vendor/products/add" className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shrink-0">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl border border-slate-700/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-700/50">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-white line-clamp-1">{product.title}</p>
                        <p className="text-xs text-slate-400">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-white">${product.price}</td>
                  <td className="p-4">
                    {product.stock > 0 ? (
                      <span className="text-green-400 font-medium">{product.stock} in stock</span>
                    ) : (
                      <span className="text-red-400 font-medium">Out of stock</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" /> {product.rating}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
