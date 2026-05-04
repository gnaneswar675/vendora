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

// Keeping these mocked for now until we build full order/user management
export async function getOrders() {
  return [];
}

export async function getUsers() {
  return [];
}

export async function getVendorStats() {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageRating: 0
  };
}
