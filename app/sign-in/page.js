"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Lock, Mail } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const defaultRole = searchParams.get('role') || 'buyer';
  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Wait for auth state to update before redirecting or let it redirect based on user role?
      // For now, let's redirect to shop. The role will be fetched by AuthProvider.
      router.push('/');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8">
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'buyer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setRole('buyer')}
          type="button"
        >
          Buyer
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'vendor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setRole('vendor')}
          type="button"
        >
          Vendor
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setRole('admin')}
          type="button"
        >
          Admin
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500" />
            Remember me
          </label>
          <Link href="#" className="text-blue-400 hover:text-blue-300">Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <p className="text-center text-slate-400 mt-8 text-sm">
        Don't have an account? <Link href={`/sign-up?role=${role}`} className="text-blue-400 hover:text-blue-300 font-medium">Sign up</Link>
      </p>
    </>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 rounded-3xl w-full max-w-md relative z-10 border border-slate-700/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your Vendora account</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>}>
          <SignInForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
