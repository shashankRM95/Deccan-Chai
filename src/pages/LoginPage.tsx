import { useState } from 'react';
import { User, Store, ArrowRight, Shield } from 'lucide-react';
import { useRouter } from '@/router';

export function LoginPage() {
  const { navigate } = useRouter();

  return (
    <div className="pt-20 lg:pt-24 bg-grain min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <p className="section-label justify-center">Welcome to Deccan Chai</p>
          <h1 className="heading text-3xl lg:text-4xl mt-3 mb-3">Choose Your Login Method</h1>
          <p className="prose-body text-sm">Sign in to track orders, earn rewards, or manage your store.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <button
            onClick={() => navigate('customer-login')}
            className="card p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-2xl bg-maroon-50 dark:bg-navy-800 text-maroon-700 dark:text-gold-300 group-hover:scale-105 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-xl text-navy-900 dark:text-cream-50 mb-1.5">Customer Login</h3>
            <p className="text-sm text-navy-600 dark:text-cream-200/70 mb-4">Track orders, earn loyalty points, reorder favourites.</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-maroon-700 dark:text-gold-300">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => navigate('owner-login')}
            className="card p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-2xl bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-gold-300 group-hover:scale-105 transition-transform">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-xl text-navy-900 dark:text-cream-50 mb-1.5">Owner Login</h3>
            <p className="text-sm text-navy-600 dark:text-cream-200/70 mb-4">Manage orders, menu, inventory, staff & analytics.</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-maroon-700 dark:text-gold-300">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-navy-400 dark:text-cream-200/50">
          <Shield className="w-3.5 h-3.5" />
          Your data is secure · 256-bit encryption
        </div>

        <p className="text-center mt-6 text-sm text-navy-600 dark:text-cream-200/70">
          New to Deccan Chai?{' '}
          <button onClick={() => navigate('signup')} className="font-semibold text-maroon-700 dark:text-gold-300 hover:underline">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
