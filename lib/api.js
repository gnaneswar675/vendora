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

export async function getVendorStats() {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageRating: 0
  };
}
