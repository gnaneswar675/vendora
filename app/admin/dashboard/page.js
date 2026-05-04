"use client";
import { useState, useEffect } from 'react';
import { getUsers, getOrders } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Store, Activity, ShieldAlert, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getOrders()]).then(([usersData, ordersData]) => {
      setUsers(usersData);
      setOrders(ordersData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-slate-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
          </div>
          <div className="h-[400px] bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const vendors = users.filter(u => u.role === 'vendor');
  const buyers = users.filter(u => u.role === 'buyer');

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Control Center</h1>
          <p className="text-slate-400">Monitor platform health and user activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10"><Users className="h-6 w-6 text-blue-400" /></div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10"><Store className="h-6 w-6 text-purple-400" /></div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Active Vendors</h3>
          <p className="text-3xl font-bold text-white">{vendors.length}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-500/10"><Activity className="h-6 w-6 text-green-400" /></div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Platform Orders</h3>
          <p className="text-3xl font-bold text-white">{orders.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-500/10"><ShieldAlert className="h-6 w-6 text-red-400" /></div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Pending Approvals</h3>
          <p className="text-3xl font-bold text-white">2</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-3xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link href="#" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                  user.role === 'vendor' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 rounded-3xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Link href="#" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-white">{order.id}</p>
                  <p className="text-xs text-slate-400">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-blue-400">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{order.status}</p>
                </div>
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
