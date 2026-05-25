"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingCart, X, AlertCircle } from 'lucide-react';

const CartContext = createContext();

function CartToast({ toast, onDismiss }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -30, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, x: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            top: '5.5rem',
            right: '1.5rem',
            zIndex: 9999,
            maxWidth: '22rem',
            width: '100%',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '1rem',
              padding: '1rem 1.25rem',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.15), 0 10px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
            }}
          >
            {/* Animated check icon */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: toast.type === 'error' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                border: toast.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {toast.type === 'error' ? (
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
              ) : (
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e' }} />
              )}
            </motion.div>

            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: toast.type === 'error' ? '#ef4444' : '#22c55e',
                marginBottom: '0.125rem',
                letterSpacing: '0.025em',
              }}>
                {toast.type === 'error' ? 'Stock Limit Reached' : 'Added to Cart'}
              </p>
              <p style={{
                fontSize: '0.8125rem',
                color: '#d1d5db',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4,
              }}>
                {toast.type === 'error' 
                  ? `Cannot add more ${toast.title}` 
                  : `${toast.title}${toast.quantity > 1 ? ` × ${toast.quantity}` : ''}`
                }
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                color: '#9ca3af',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <X style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3.5, ease: 'linear' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '1rem',
              right: '1rem',
              height: '2px',
              background: toast.type === 'error' ? 'linear-gradient(to right, #ef4444, #b91c1c)' : 'linear-gradient(to right, #3b82f6, #22c55e)',
              borderRadius: '0 0 1rem 1rem',
              transformOrigin: 'left',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  // Load from local storage on mount (optional, to keep state across refreshes)
  useEffect(() => {
    const savedCart = localStorage.getItem('vendora_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Could not parse cart", e);
      }
    }
  }, []);

  // Save to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('vendora_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showToast = useCallback((product, quantity, type = 'success') => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({
      id: Date.now(),
      title: product.title,
      quantity,
      type
    });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 3500);
  }, []);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
    timerRef.current = null;
  }, []);

  const addToCart = (product, quantity = 1) => {
    const existing = cartItems.find(item => item.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const stock = product.stock || 0;
    
    const maxAddable = Math.max(0, stock - currentQty);
    const actualAddable = Math.min(quantity, maxAddable);

    if (actualAddable === 0) {
      showToast(product, 0, 'error');
      return;
    }

    setCartItems(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        return prev.map(item => {
          if (item.id === product.id) {
            return { ...item, quantity: item.quantity + actualAddable };
          }
          return item;
        });
      }
      return [...prev, { ...product, quantity: actualAddable }];
    });
    showToast(product, actualAddable, 'success');
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    
    const existing = cartItems.find(item => item.id === id);
    if (!existing) return;
    
    const stock = existing.stock || 0;
    if (quantity > stock) {
      showToast(existing, 0, 'error');
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const itemStock = item.stock || 0;
        const finalQuantity = Math.min(quantity, itemStock);
        return { ...item, quantity: finalQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
      <CartToast toast={toast} onDismiss={dismissToast} />
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
