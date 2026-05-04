import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';

export async function getProducts() {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

export async function getVendorProducts(vendorId) {
  try {
    const q = query(collection(db, 'products'), where("vendorId", "==", vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return [];
  }
}

export async function createOrder(orderData) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getUserOrders(userId) {
  try {
    const q = query(collection(db, 'orders'), where("buyerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export async function addProductReview(productId, reviewData, currentRating, currentReviews) {
  try {
    // 1. Add the review to a 'reviews' subcollection
    await addDoc(collection(db, `products/${productId}/reviews`), {
      ...reviewData,
      createdAt: new Date().toISOString()
    });

    // 2. Update the product's overall rating and review count
    const newReviewsCount = (currentReviews || 0) + 1;
    const newRating = (((currentRating || 0) * (currentReviews || 0)) + reviewData.rating) / newReviewsCount;
    
    // We update only 1 decimal place
    const roundedRating = Math.round(newRating * 10) / 10;

    const productRef = doc(db, 'products', productId);
    // Since we're partially updating, setDoc with merge: true
    await setDoc(productRef, {
      rating: roundedRating,
      reviews: newReviewsCount
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
}

export async function getProductReviews(productId) {
  try {
    const reviewsCol = collection(db, `products/${productId}/reviews`);
    const reviewSnapshot = await getDocs(reviewsCol);
    return reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function getUsers() {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getOrders() {
  try {
    const ordersCol = collection(db, 'orders');
    const orderSnapshot = await getDocs(ordersCol);
    return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getVendorOrders(vendorId) {
  try {
    // Note: In a real app, you'd filter orders that contain items from this vendorId.
    // For now, we'll fetch all orders and filter client-side or assume orders are mapped correctly.
    const allOrders = await getOrders();
    return allOrders.filter(order => 
      order.items.some(item => item.vendorId === vendorId)
    );
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
}

export async function getVendorStats(vendorId) {
  try {
    const vendorProducts = await getVendorProducts(vendorId);
    const vendorOrders = await getVendorOrders(vendorId);
    
    const totalRevenue = vendorOrders.reduce((acc, order) => {
      const vendorItems = order.items.filter(item => item.vendorId === vendorId);
      const orderRevenue = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return acc + orderRevenue;
    }, 0);

    const avgRating = vendorProducts.length > 0 
      ? vendorProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / vendorProducts.length 
      : 0;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      activeOrders: vendorOrders.filter(o => o.status !== 'Delivered').length,
      totalOrders: vendorOrders.length,
      totalProducts: vendorProducts.length,
      rating: avgRating.toFixed(1),
      revenueData: [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: totalRevenue * 0.2 },
        { name: 'Mar', value: totalRevenue * 0.5 },
        { name: 'Apr', value: totalRevenue * 0.8 },
        { name: 'May', value: totalRevenue },
      ]
    };
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return {
      totalRevenue: 0,
      activeOrders: 0,
      totalOrders: 0,
      totalProducts: 0,
      rating: 0,
      revenueData: []
    };
  }
}
