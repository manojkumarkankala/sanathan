import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AdminInfo {
  email: string;
  role: string;
}

interface AuthContextType {
  session: Session | null;
  isAdmin: boolean;
  adminInfo: AdminInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        checkAdmin(data.session.user.id, data.session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) {
        (async () => {
          await checkAdmin(sess.user.id, sess.user.email || '');
        })();
      } else {
        setIsAdmin(false);
        setAdminInfo(null);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string, email: string) {
    const { data } = await supabase
      .from('admins')
      .select('email, role')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      setIsAdmin(true);
      setAdminInfo({ email: data.email, role: data.role });
    } else {
      setIsAdmin(false);
      setAdminInfo(null);
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminInfo(null);
  }

  return (
    <AuthContext.Provider value={{ session, isAdmin, adminInfo, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
