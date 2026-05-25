"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { motion } from 'framer-motion';
import { getProducts } from '@/lib/api';
import Link from 'next/link';
import { Search, Filter, Star, ShoppingCart, ChevronDown } from 'lucide-react';

export default function Shop() {
  const router = useRouter();
  const { role } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Electronics', 'Cyber-Wear', 'Gaming', 'Power'];

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Explore the Future</h1>
          <p className="text-slate-400">Discover the latest tech and gear.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Filter className="h-4 w-4" /> 
              <span className="hidden md:inline">{selectedCategory === 'All' ? 'Filter' : selectedCategory}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors ${selectedCategory === category ? 'text-blue-400 font-bold bg-slate-700/50' : 'text-slate-300'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="glass-card rounded-2xl h-80 animate-pulse border border-slate-700/50">
              <div className="h-48 bg-slate-800 rounded-t-2xl"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-8 bg-slate-800 rounded w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#0a0a0a] rounded-2xl overflow-hidden group border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col shadow-2xl shadow-black/50"
            >
              <Link href={`/product/${product.id}`} className="block relative overflow-hidden h-40 bg-slate-900">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"
                  }}
                />
                <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                  {product.category}
                </div>
              </Link>
              <div className="p-4 flex-1 flex flex-col relative z-20">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/product/${product.id}`} className="font-extrabold text-lg text-white hover:text-blue-500 transition-colors line-clamp-1 tracking-tight">
                    {product.title}
                  </Link>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 text-sm mb-3 font-medium">
                  <Star className="h-4 w-4 fill-current" /> {product.rating || 0} <span className="text-slate-500 text-xs ml-1">({product.reviews || 0} reviews)</span>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                  <span className="text-white font-black text-xl tracking-tight">₹{product.price}</span>
                  <button onClick={(e) => {
                    e.preventDefault();
                    if (role !== 'buyer') {
                      router.push('/sign-in');
                    } else {
                      addToCart(product);
                    }
                  }} className="h-10 w-10 rounded-full bg-white hover:bg-blue-600 text-black hover:text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
