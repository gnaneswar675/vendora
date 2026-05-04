"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const { role, user, logout } = useAuth();
  const { cartCount, clearCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between relative">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white z-10 shrink-0">
          VEND<span className="text-blue-500">ORA</span>
        </Link>
        
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-slate-300 w-max">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          
          {(!role || role === 'buyer') && (
            <>
              <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
              {!role && (
                <>
                  <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                  <Link href="/sign-up?role=vendor" className="hover:text-white transition-colors">Become a Seller</Link>
                </>
              )}
            </>
          )}

          {role === 'vendor' && (
            <>
              <Link href="/vendor/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/vendor/products" className="hover:text-white transition-colors">Products</Link>
              <Link href="/vendor/orders" className="hover:text-white transition-colors">Orders</Link>
              <Link href="/vendor/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </>
          )}

          {role === 'admin' && (
            <Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-4 z-10 shrink-0">
          {(!role || role === 'buyer') && (
            <>
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>

              {role === 'buyer' && (
                <Link href="/cart" className="p-2 text-slate-300 hover:text-white transition-colors relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
              )}
            </>
          )}

          {role ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0)}
                </div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass-card rounded-xl overflow-hidden py-1 border border-slate-700"
                  >
                    <div className="px-4 py-2 border-b border-slate-700/50">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{role}</p>
                    </div>
                    
                    {role === 'buyer' && (
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white" onClick={() => setIsDropdownOpen(false)}>
                        <Package className="h-4 w-4" /> My Orders
                      </Link>
                    )}

                    {role === 'vendor' && (
                      <Link href="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white" onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    )}

                    {role === 'admin' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white" onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    )}

                    <button 
                      onClick={() => { 
                        logout(); 
                        clearCart();
                        setIsDropdownOpen(false); 
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800/50 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/sign-in" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              <User className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
