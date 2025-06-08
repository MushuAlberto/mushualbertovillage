import { supabase } from './supabaseClient';
import type { SignUpWithPasswordCredentials, SignInWithPasswordCredentials, AuthChangeEvent, Session, User } from '@supabase/supabase-js';

const signUpWithEmail = async (credentials: SignUpWithPasswordCredentials) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) throw error;
  return data;
};

const signInWithEmail = async (credentials: SignInWithPasswordCredentials) => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
};

const signOutUser = async () => {
  if (!supabase) throw new Error("Supabase client not initialized.");
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  const { data: { user } , error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching current user:", error.message);
    return null;
  }
  return user;
};

const getSession = async (): Promise<Session | null> => {
  if (!supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
   if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }
  return session;
}

const onAuthStateChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  if (!supabase) {
    console.warn("Supabase client not initialized. Auth state changes will not be monitored.");
    return { data: { subscription: null } }; // Return a compatible structure
  }
  return supabase.auth.onAuthStateChange(callback);
};

export const authService = {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  getCurrentUser,
  getSession,
  onAuthStateChange,
};
