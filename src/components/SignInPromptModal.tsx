import { User, KeyRound, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/router';

interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SignInPromptModal({ isOpen, onClose, message }: SignInPromptModalProps) {
  const { navigate } = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-navy-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-cream-200/50 dark:border-cream-100/10 relative overflow-hidden text-center transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-maroon-700/20 rounded-full blur-2xl pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full text-navy-400 hover:text-navy-900 dark:text-cream-200/50 dark:hover:text-cream-50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-2xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300 shadow-inner">
          <KeyRound className="w-8 h-8" />
        </div>

        <h3 className="font-sans font-bold text-2xl text-navy-900 dark:text-cream-50 mb-2">
          Sign In to Place Order
        </h3>

        <p className="text-sm text-navy-600 dark:text-cream-200/80 mb-6 leading-relaxed">
          {message || 'Please sign in or enter OTP to customize items, place table orders, and earn Deccan Chai rewards.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              navigate('customer-login');
            }}
            className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-maroon-900/20"
          >
            <User className="w-4 h-4" />
            Sign In with OTP / Password
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('signup');
            }}
            className="w-full py-3 text-sm font-semibold text-navy-700 dark:text-cream-200 bg-cream-100 dark:bg-navy-800 hover:bg-cream-200 dark:hover:bg-navy-700 rounded-2xl transition-colors"
          >
            Create New Account
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-navy-500 dark:text-cream-200/60 hover:underline"
          >
            Continue Browsing Menu
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-cream-200/50 dark:border-cream-100/10 flex items-center justify-center gap-1.5 text-[11px] text-navy-400 dark:text-cream-200/50">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          Instant 1-Click OTP Verification available
        </div>
      </div>
    </div>
  );
}
