"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut, getUserProfile, resetPassword as supabaseResetPassword } from '@/lib/services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'buyer', 'vendor', 'admin', or null
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleUserSession = async (authUser) => {
    try {
      if (authUser) {
        // Fetch user profile from public.users table in Supabase
        let profile = await getUserProfile(authUser.id);

        // Self-healing: if profile row is missing in public.users, create it now since we are authenticated
        if (!profile) {
          const fallbackName = authUser.user_metadata?.name || 'Unknown';
          const fallbackRole = authUser.user_metadata?.role || 'buyer';
          
          console.log(`[Auth] Profile missing for user ${authUser.id}. Attempting self-healing creation...`);
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              name: fallbackName,
              role: fallbackRole,
              created_at: new Date().toISOString()
            });
            
          if (!insertError) {
            console.log('[Auth] Self-healing profile created successfully.');
            profile = await getUserProfile(authUser.id);
          } else {
            console.error('[Auth] Self-healing profile creation failed:', insertError);
          }
        }

        if (profile) {
          setRole(profile.role);
          setUser({
            uid: authUser.id,
            name: profile.name,
            email: authUser.email,
            role: profile.role
          });
        } else {
          // Fallback using auth metadata if DB insert failed
          const metaRole = authUser.user_metadata?.role || 'buyer';
          setRole(metaRole);
          setUser({
            uid: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 'Unknown',
            role: metaRole
          });
        }
      } else {
        setRole(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user profile in Supabase:", error);
      setRole(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user || null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const userRole = await supabaseSignIn(email, password);
      return userRole;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = async (email, password, name, selectedRole) => {
    try {
      return await supabaseSignUp(email, password, name, selectedRole);
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabaseSignOut();
      setRole(null);
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const resetPassword = async (email) => {
    try {
      await supabaseResetPassword(email);
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ role, user, login, signup, logout, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
