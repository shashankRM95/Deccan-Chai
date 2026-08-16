import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, Shield, Eye, EyeOff, Loader2, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { useRouter } from '@/router';
import { useAuth } from '@/context/AuthContext';

export function OwnerLoginPage() {
  const { navigate } = useRouter();
  const { signIn, sendOtp, verifyOtp, resetPassword } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('password'); // Default to password for owners

  // Password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  // OTP state
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string>((Math.floor(10000000 + Math.random() * 90000000)).toString());
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [showSmtpGuide, setShowSmtpGuide] = useState(false);

  // Common UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setOtpSuccessMsg(null);

    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email address below to receive a password reset link.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(targetEmail);
      if (res.error) {
        setError(res.error);
      } else {
        setOtpSuccessMsg(`Password reset email sent to ${targetEmail}. Please check your inbox!`);
      }
    } catch {
      setError('Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      localStorage.removeItem('demo_user_session');
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
      else {
        localStorage.setItem('role', 'owner');
        navigate('owner-dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFormattedTarget = () => {
    let target = otpChannel === 'email' ? otpEmail.trim() : otpPhone.trim();
    if (otpChannel === 'phone' && target && !target.startsWith('+')) {
      const cleanDigits = target.replace(/\D/g, '');
      if (cleanDigits.length === 10) {
        target = `+91${cleanDigits}`;
      }
    }
    return target;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpSuccessMsg(null);
    
    const target = getFormattedTarget();
    if (!target) {
      setError(otpChannel === 'email' ? 'Please enter a valid Gmail / Email address.' : 'Please enter a valid phone number.');
      return;
    }

    const verifiedKey = `otp_verified_${target.trim().toLowerCase()}`;
    const verifiedStr = localStorage.getItem(verifiedKey);
    if (verifiedStr) {
      try {
        const demoSessionStr = localStorage.getItem('demo_user_session');
        if (demoSessionStr) {
          localStorage.setItem('role', 'owner');
          navigate('owner-dashboard');
          return;
        }
      } catch {
        localStorage.removeItem(verifiedKey);
      }
    }

    setLoading(true);
    try {
      const res = await sendOtp(target, otpChannel);
      if (res.error) {
        setError(res.error);
      } else {
        if (res.code) setGeneratedCode(res.code);
        setOtpSent(true);
        setResendTimer(60);
        setOtpSuccessMsg(`OTP code sent to ${target}. Check your ${otpChannel === 'email' ? 'inbox' : 'SMS messages'}. ${res.code ? `(Demo Code: ${res.code})` : ''}`);
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = getFormattedTarget();
    if (!otpToken.trim() || otpToken.trim().length < 6) {
      setError('Please enter the exact 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await verifyOtp(target, otpToken.trim(), otpChannel, 'owner');
      if (err) {
        setError(err);
      } else {
        localStorage.setItem('role', 'owner');
        navigate('owner-dashboard');
      }
    } catch {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 lg:pt-24 bg-grain min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-1.5 text-sm text-navy-500 dark:text-cream-200/60 hover:text-maroon-700 dark:hover:text-gold-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="card p-7">
          <div id="recaptcha-container"></div>
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid place-items-center w-14 h-14 rounded-2xl bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-gold-300">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="font-sans font-bold text-2xl text-navy-900 dark:text-cream-50">
              {loginMethod === 'otp' ? 'Owner OTP Login' : 'Owner Password Login'}
            </h1>
            <p className="prose-body text-sm mt-1">
              Authorized owner access — sign in with OTP or password
            </p>
          </div>

          <div className="flex rounded-xl bg-cream-100 dark:bg-navy-800 p-1 mb-6 border border-cream-300/40 dark:border-cream-100/10">
            <button
              type="button"
              onClick={() => { setLoginMethod('password'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'password' ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'text-navy-600 dark:text-cream-200/70 hover:text-navy-900 dark:hover:text-cream-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Password
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('otp'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'otp' ? 'bg-maroon-700 text-cream-50 shadow-sm' : 'text-navy-600 dark:text-cream-200/70 hover:text-navy-900 dark:hover:text-cream-50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> OTP Login
            </button>
          </div>

          <div className="mb-5 rounded-xl bg-navy-50 dark:bg-navy-800 border border-navy-200/50 dark:border-navy-700 px-4 py-2.5 text-xs text-navy-700 dark:text-cream-200/70 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-navy-600 dark:text-gold-400 shrink-0" />
            This is a restricted area. All access is logged and monitored.
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {otpSuccessMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          {loginMethod === 'otp' ? (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Field icon={Mail} label="Owner Email Address">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={otpEmail}
                      onChange={(e) => { setOtpEmail(e.target.value); setOtpChannel('email'); }}
                      placeholder="owner@example.com"
                      className="w-full bg-transparent focus:outline-none text-sm text-navy-900 dark:text-cream-50"
                    />
                  </Field>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Secure OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-xl bg-navy-950 text-cream-50 p-4 border border-gold-400/40 shadow-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-gold-300">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gold-400" /> {otpChannel === 'email' ? 'Email OTP Sent' : 'Mobile SMS OTP Sent'}</span>
                      <span className="text-[10px] bg-emerald-500 text-navy-950 font-bold px-2 py-0.5 rounded-full">Sent</span>
                    </div>
                    <p className="text-xs text-cream-200/90 leading-relaxed">
                      A 6-digit verification code was sent to <strong>{getFormattedTarget()}</strong>. Check your {otpChannel === 'email' ? 'inbox or spam folder.' : 'messages.'}
                    </p>
                  </div>
                  <div className="bg-cream-100 dark:bg-navy-800 p-3 rounded-xl border border-cream-300/40 dark:border-cream-100/10 text-xs text-navy-700 dark:text-cream-200/80 flex items-center justify-between">
                    <span>Target: <strong>{getFormattedTarget()}</strong></span>
                    <button type="button" onClick={() => { setOtpSent(false); setOtpToken(''); setError(null); }} className="text-maroon-700 dark:text-gold-300 underline font-semibold hover:opacity-80">Change</button>
                  </div>
                  <Field icon={KeyRound} label="Enter 6-Digit OTP Code">
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*" required maxLength={6} autoComplete="one-time-code"
                      value={otpToken} onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code" className="w-full bg-transparent focus:outline-none text-sm tracking-widest font-mono text-navy-900 dark:text-cream-50"
                    />
                  </Field>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-500 dark:text-cream-200/60">{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Didn\'t receive code?'}</span>
                    {resendTimer === 0 && (
                      <button type="button" onClick={handleSendOtp} className="text-maroon-700 dark:text-gold-300 font-semibold hover:underline inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Resend OTP</button>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Access Dashboard <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  {/* Collapsible SMTP / SMS setup guide */}
                  <div className="mt-3 pt-3 border-t border-cream-300/40 dark:border-cream-100/10">
                    <button
                      type="button"
                      onClick={() => setShowSmtpGuide(!showSmtpGuide)}
                      className="text-xs text-navy-600 dark:text-cream-200/70 hover:text-maroon-700 dark:hover:text-gold-300 flex items-center justify-between w-full font-medium"
                    >
                      <span>⚙️ How to configure Real SMTP Email &amp; SMS Gateway</span>
                      <span>{showSmtpGuide ? '▲' : '▼'}</span>
                    </button>
                    {showSmtpGuide && (
                      <div className="mt-2 text-[11px] text-navy-600 dark:text-cream-200/70 bg-cream-100 dark:bg-navy-800 p-3 rounded-xl space-y-2 border border-cream-300/30">
                        <p className="font-bold text-navy-900 dark:text-cream-50">1. Real Gmail / SMTP Delivery:</p>
                        <p>In Supabase Dashboard &gt; Authentication &gt; Custom SMTP:</p>
                        <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px]">
                          <li>Host: smtp.gmail.com | Port: 587</li>
                          <li>User: your-gmail@gmail.com</li>
                          <li>Pass: Google App Password</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Field icon={Mail} label="Owner Email">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" className="w-full bg-transparent focus:outline-none text-sm text-navy-900 dark:text-cream-50" />
              </Field>
              <Field icon={Lock} label="Password">
                <input type={showPwd ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent focus:outline-none text-sm text-navy-900 dark:text-cream-50" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-navy-400 hover:text-navy-600 dark:text-cream-200/50">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
              
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-navy-600 dark:text-cream-200/70">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-cream-300 text-maroon-700 focus:ring-gold-400" />
                  Remember me
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-maroon-700 dark:text-gold-300 font-medium hover:underline">Forgot password?</button>
              </div>
              
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In Securely <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <p className="text-center mt-5 text-xs text-navy-400 dark:text-cream-200/50">
            Need owner access? Contact your store administrator.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-navy-400 dark:text-cream-200/50">
          <Shield className="w-3.5 h-3.5" />
          256-bit SSL encryption · Your data is secure
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-navy-500 dark:text-cream-200/60 mb-1.5">{label}</label>
      <div className="flex items-center gap-2.5 rounded-xl bg-cream-50 dark:bg-navy-800 border border-cream-300 dark:border-cream-100/10 focus-within:ring-2 focus-within:ring-gold-400 px-3.5 py-3">
        <Icon className="w-4 h-4 text-navy-400 dark:text-cream-200/50 shrink-0" />
        {children}
      </div>
    </div>
  );
}
