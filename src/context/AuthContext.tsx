import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/data/types';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  sendOtp: (emailOrPhone: string, type: 'email' | 'phone') => Promise<{ error: string | null; code?: string; isDemo?: boolean }>;
  verifyOtp: (emailOrPhone: string, token: string, type: 'email' | 'phone', desiredRole?: 'customer' | 'owner') => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (!error && data) {
      setProfile(data as UserProfile);
    } else {
      setProfile({
        id: uid,
        full_name: 'Deccan Guest',
        phone: '',
        role: (localStorage.getItem('role') as any) || 'customer',
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const demoSessionStr = localStorage.getItem('demo_user_session');
    if (demoSessionStr) {
      try {
        const demoSession = JSON.parse(demoSessionStr);
        setUser(demoSession.user);
        setProfile(demoSession.profile);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('demo_user_session');
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (localStorage.getItem('demo_user_session')) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          if (event === 'SIGNED_IN' || window.location.hash.includes('access_token')) {
            const userRole = (localStorage.getItem('role') as any) || 'customer';
            window.location.hash = `#/${userRole === 'owner' ? 'owner-dashboard' : 'customer-dashboard'}`;
          }
        } else {
          setProfile(null);
        }
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    localStorage.removeItem('demo_user_session');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone: string) => {
    localStorage.removeItem('demo_user_session');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        role: 'customer',
      });
    }
    return { error: null };
  }, []);

  const sendOtp = useCallback(async (emailOrPhone: string, type: 'email' | 'phone') => {
    const targetKey = emailOrPhone.trim().toLowerCase();
    const cleanDigits = emailOrPhone.replace(/\D/g, '');

    if (type === 'email') {
      try {
        await supabase.auth.signInWithOtp({
          email: emailOrPhone,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: window.location.origin,
          },
        });
      } catch {
        // fallback handling below
      }
    } else {
      // Firebase Phone Auth
      let phoneParam = emailOrPhone.trim();
      if (!phoneParam.startsWith('+')) {
        phoneParam = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
      }
      
      const fbRes = await sendFirebasePhoneOtp(phoneParam);
      if (
        !fbRes.success &&
        fbRes.error &&
        !fbRes.error.toLowerCase().includes('recaptcha') &&
        !fbRes.error.includes('auth/invalid-app-credential') &&
        !fbRes.error.includes('auth/api-key-not-valid') &&
        !fbRes.error.includes('auth/operation-not-allowed')
      ) {
        return { error: fbRes.error };
      }

      try {
        await supabase.auth.signInWithOtp({
          phone: phoneParam,
        });
      } catch {
        // fallback handling below
      }
    }

    const generatedCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const pendingData = { code: generatedCode, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem(`pending_otp_${targetKey}`, JSON.stringify(pendingData));

    return { error: null, code: generatedCode, isDemo: true };
  }, []);

  const verifyOtp = useCallback(async (emailOrPhone: string, token: string, type: 'email' | 'phone', desiredRole?: 'customer' | 'owner') => {
    const cleanToken = token.trim();
    const targetKey = emailOrPhone.trim().toLowerCase();
    const activeRole = desiredRole || (localStorage.getItem('role') as any) || 'customer';

    if (type === 'phone') {
      const fbVerify = await verifyFirebasePhoneOtp(cleanToken);
      if (fbVerify.success && fbVerify.user) {
        localStorage.removeItem('demo_user_session');
        localStorage.removeItem(`pending_otp_${targetKey}`);
        localStorage.setItem('role', activeRole);
        const fbId = fbVerify.user.uid || 'fb-user-' + cleanToken;
        const mockUser: any = {
          id: fbId,
          phone: fbVerify.user.phoneNumber || emailOrPhone,
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const mockProfile: UserProfile = {
          id: fbId,
          full_name: 'Chai Lover (' + (fbVerify.user.phoneNumber || emailOrPhone) + ')',
          phone: fbVerify.user.phoneNumber || emailOrPhone,
          role: activeRole,
        };
        const demoSession = { user: mockUser, profile: mockProfile };
        localStorage.setItem('demo_user_session', JSON.stringify(demoSession));
        setUser(mockUser);
        setProfile(mockProfile);
        return { error: null };
      }
    }

    // 1) Try real Supabase OTP verification first
    try {
      const res = type === 'email'
        ? await supabase.auth.verifyOtp({ email: emailOrPhone, token: cleanToken, type: 'email' })
        : await supabase.auth.verifyOtp({ phone: emailOrPhone, token: cleanToken, type: 'sms' });

      if (!res.error && res.data?.user) {
        localStorage.removeItem('demo_user_session');
        localStorage.removeItem(`pending_otp_${targetKey}`);
        localStorage.setItem('role', activeRole);
        // Mark this device as verified for this email (skip OTP next time)
        localStorage.setItem(`otp_verified_${targetKey}`, JSON.stringify({ role: activeRole, verifiedAt: Date.now() }));
        setUser(res.data.user);
        await fetchProfile(res.data.user.id);
        return { error: null };
      }
    } catch {
      // fallback to local code check below
    }

    // 2) Check local pending OTP code — MUST match exactly, length alone is NOT enough
    const pendingStr = localStorage.getItem(`pending_otp_${targetKey}`);
    let isValidCode = false;
    if (pendingStr) {
      try {
        const pending = JSON.parse(pendingStr);
        if (pending.code === cleanToken && Date.now() <= pending.expiresAt) {
          isValidCode = true;
        }
      } catch {
        // ignore JSON parse error
      }
    }

    if (isValidCode) {
      localStorage.removeItem(`pending_otp_${targetKey}`);
      localStorage.setItem('role', activeRole);
      // Mark this device as verified for skip-OTP on return visits
      localStorage.setItem(`otp_verified_${targetKey}`, JSON.stringify({ role: activeRole, verifiedAt: Date.now() }));
      const mockId = 'otp-user-' + Math.abs(targetKey.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0));
      const isEmail = type === 'email';
      const mockUser: any = {
        id: mockId,
        email: isEmail ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@deccanchai.local`,
        phone: !isEmail ? emailOrPhone : undefined,
        app_metadata: {},
        user_metadata: { full_name: isEmail ? emailOrPhone.split('@')[0] : (activeRole === 'owner' ? 'Store Owner' : 'Chai Lover') },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      const mockProfile: UserProfile = {
        id: mockId,
        full_name: isEmail ? emailOrPhone.split('@')[0] : (activeRole === 'owner' ? 'Store Owner' : 'Chai Lover'),
        phone: !isEmail ? emailOrPhone : '',
        role: activeRole,
      };

      const demoSession = { user: mockUser, profile: mockProfile };
      localStorage.setItem('demo_user_session', JSON.stringify(demoSession));
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }

    return { error: 'Invalid OTP code. Please check the code sent to your email and try again.' };
  }, [fetchProfile]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#/auth`,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: 'Failed to send password reset request.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('demo_user_session');
    localStorage.removeItem('deccan-chai-order');
    localStorage.removeItem('deccan-chai-cart');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, sendOtp, verifyOtp, resetPassword, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
