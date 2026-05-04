"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'buyer', 'vendor', 'admin', or null
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user document to get the role
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);
          setUser({ uid: firebaseUser.uid, name: userData.name, email: firebaseUser.email, role: userData.role });
        } else {
          // Fallback if no doc exists
          setRole('buyer');
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: 'Unknown', role: 'buyer' });
        }
      } else {
        setRole(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = async (email, password, name, selectedRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Save user role and name to Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        name,
        email,
        role: selectedRole,
        createdAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ role, user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
