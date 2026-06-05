"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, User, Check } from 'lucide-react';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  
  const defaultRole = searchParams.get('role') || 'buyer';
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      // Pass the storeName as part of the name if they are a vendor for simplicity right now
      const displayName = role === 'vendor' ? `${name} (${storeName})` : name;
      const result = await signup(email, password, displayName, role);
      
      if (result && !result.sessionConfirmed) {
        setSuccessMessage('Please check your email to verify and confirm your account before logging in.');
      } else {
        // Let the AuthProvider load the role and handle redirect, or do it here
        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'vendor') router.push('/vendor/dashboard');
        else router.push('/shop');
      }
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
    }
    setLoading(false);
  };

  if (successMessage) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Verification Required</h2>
        <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
          {successMessage}
        </p>
        <div className="pt-4">
          <Link href={`/sign-in?role=${role}`} className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold transition-all text-sm">
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8">
        <button 
          type="button"
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'buyer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setRole('buyer')}
        >
          Buyer
        </button>
        <button 
          type="button"
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'vendor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setRole('vendor')}
        >
          Vendor
        </button>
        <button 
          type="button"
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setRole('admin')}
        >
          Admin
        </button>
      </div>

      {error && (
        error.toLowerCase().includes('rate limit') ? (
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 p-4 rounded-xl mb-6 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Supabase Email Rate Limit Exceeded
            </div>
            <p>
              Supabase restricts the number of signup attempts (typically 3/hour on the default SMTP testing server) to prevent spam.
            </p>
            <div className="pt-1 border-t border-slate-700/50 space-y-1">
              <span className="font-semibold text-amber-200 block mb-1">How to fix this in your Supabase Dashboard:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong className="text-white">Option A (Fastest for Dev):</strong> Go to <span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px]">Auth &gt; Providers &gt; Email</span> and disable <strong className="text-white">Confirm Email</strong>. This allows signing up instantly without sending verification emails.
                </li>
                <li>
                  <strong className="text-white">Option B (SMTP):</strong> Configure a custom SMTP provider in <span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px]">Project Settings &gt; Auth &gt; SMTP Settings</span> (e.g. Resend, SendGrid) to remove default limits.
                </li>
                <li>
                  <strong className="text-white">Option C (Rate Limits):</strong> Go to <span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px]">Auth &gt; Rate Limits</span> to adjust limits.
                </li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-400 italic pt-1">
              Tip: While developing, you can also try using a different email address or wait a few minutes before trying again.
            </p>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>
        </div>

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
              minLength={6}
            />
          </div>
        </div>

        {role === 'vendor' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Store Name</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-transparent" />
              <input 
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="FutureKicks"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <p className="text-center text-slate-400 mt-8 text-sm">
        Already have an account? <Link href={`/sign-in?role=${role}`} className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
      </p>
    </>
  );
}

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[20%] right-[20%] w-64 h-64 bg-pink-600/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-[20%] left-[20%] w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 rounded-3xl w-full max-w-md relative z-10 border border-slate-700/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-400">Join the future of commerce</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>}>
          <SignUpForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
