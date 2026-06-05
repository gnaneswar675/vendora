import { supabase } from '../supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'vendor' | 'admin';
  avatar_url?: string | null;
  created_at?: string;
}

export interface SignUpResult {
  user: UserProfile;
  sessionConfirmed: boolean;
}

export async function signUp(email: string, password: string, name: string, role: 'buyer' | 'vendor' | 'admin'): Promise<SignUpResult> {
  const cleanEmail = email.trim().toLowerCase();
  // 1. Sign up user via Supabase Auth with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name,
        role,
      }
    }
  });

  if (authError || !authData.user) {
    throw authError || new Error('Auth signup failed: No user returned');
  }

  const profile: UserProfile = {
    id: authData.user.id,
    email: cleanEmail,
    name,
    role,
    avatar_url: null,
    created_at: new Date().toISOString(),
  };

  // 2. Insert profile record in the public.users table
  const { error: profileError } = await supabase
    .from('users')
    .insert(profile);

  if (profileError) {
    console.error('Failed to create user profile in public.users:', profileError);
  }

  return {
    user: profile,
    sessionConfirmed: !!authData.session,
  };
}

export async function signIn(email: string, password: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error || !data.user) {
    throw error || new Error('Login failed');
  }

  // Fetch the role from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  return profile?.role || 'buyer';
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/sign-in`,
  });
  if (error) throw error;
}

export async function getUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}
