import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_DemoKeyForFirebase12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'deccan-chai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'deccan-chai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'deccan-chai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef12345',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(app);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function setupRecaptcha(containerId = 'recaptcha-container') {
  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = undefined;
    }
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified');
      },
    });
  } catch (e) {
    console.error('reCAPTCHA init error:', e);
  }
}

export async function sendFirebasePhoneOtp(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    setupRecaptcha();
    if (!window.recaptchaVerifier) {
      return { success: false, error: 'reCAPTCHA container element not found' };
    }
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    console.log('Firebase says SMS request was successful');
    return { success: true };
  } catch (err: any) {
    console.error('Firebase OTP error:', err);
    return { success: false, error: err?.message || 'Failed to send Firebase SMS OTP' };
  }
}

export async function verifyFirebasePhoneOtp(code: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    if (!window.confirmationResult) {
      return { success: false, error: 'No active OTP request. Please request a new code.' };
    }
    const result = await window.confirmationResult.confirm(code);
    return { success: true, user: result.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Invalid 6-digit OTP verification code' };
  }
}
