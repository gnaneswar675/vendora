"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getVendorOrders, updateOrderStatus } from '@/lib/api';
import { motion } from 'framer-motion';
import { Search, Edit, MoreVertical, ChevronDown } from 'lucide-react';

export default function VendorOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.status || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || (order.status || 'Processing').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (user) {
      getVendorOrders(user.uid).then(data => {
        setOrders(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setEditingOrderId(null);
    
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert if error (Optional: refetch orders to be safe)
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
        <div className="animate-pulse h-96 bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Orders</h1>
          <p className="text-slate-400">Manage and fulfill your customer orders.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Custom Status Filter Dropdown */}
          <div className="relative shrink-0 z-40">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-full sm:w-auto min-w-[160px] bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-xl py-2 px-4 text-sm text-slate-200 focus:outline-none transition-all flex items-center justify-between"
            >
              <span className="font-medium">{statusFilter === 'All' ? 'All Statuses' : statusFilter}</span>
              <ChevronDown className={`h-4 w-4 ml-2 text-slate-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {filterOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-slate-700 shadow-2xl rounded-xl overflow-hidden z-50"
              >
                {['All', 'Processing', 'Preparing', 'Packed', 'Departed', 'Delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-700/50 ${
                      statusFilter === status ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
                    }`}
                  >
                    {status === 'All' ? 'All Statuses' : status}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          <div className="relative w-full md:w-64 z-30">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or customer..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl border border-slate-700/50 overflow-hidden"
      >
        <div className="overflow-x-auto min-h-[450px] pb-32">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-700/50">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    {searchQuery ? "No orders found matching your search." : "No orders received yet."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-medium text-white" title={order.id}>#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-slate-300">
                      {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-300">{order.buyerName || 'Unknown Buyer'}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      order.status === 'Delivered' 
                        ? 'bg-green-500/10 text-green-400'
                        : order.status === 'Departed'
                        ? 'bg-blue-500/10 text-blue-400'
                        : order.status === 'Packed'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-blue-400">₹{(order.total || 0).toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => setEditingOrderId(editingOrderId === order.id ? null : order.id)}
                        className={`p-2 transition-colors rounded-lg relative z-20 ${
                          editingOrderId === order.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                        }`}
                        title="Edit Status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* Floating Status Editor */}
                      {editingOrderId === order.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute top-full right-8 mt-2 w-40 bg-slate-800 border border-slate-700 shadow-2xl rounded-xl overflow-hidden z-50 text-left"
                        >
                          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 bg-slate-800/50">
                            Change Status
                          </div>
                          {['Processing', 'Preparing', 'Packed', 'Departed', 'Delivered'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-700/50 ${
                                order.status === status ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </motion.div>
                      )}

                      <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
