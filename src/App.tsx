import { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { useRouter } from '@/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { MenuPage } from '@/pages/MenuPage';
import { OrderPage } from '@/pages/OrderPage';
import { OutletsPage } from '@/pages/OutletsPage';
import { AboutPage } from '@/pages/AboutPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthPage } from '@/pages/AuthPage';
import { CustomerDashboard } from '@/pages/CustomerDashboard';
import { OwnerDashboard } from '@/pages/OwnerDashboard';

function App() {
  const { route } = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('deccan-chai-theme');
    if (saved === 'dark') setDarkMode(true);
    else if (saved === 'light') setDarkMode(false);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('deccan-chai-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDark = () => setDarkMode((d) => !d);

  const isDashboard = route === 'customer-dashboard' || route === 'owner-dashboard';
  const isAuthPage = route === 'login' || route === 'customer-login' || route === 'owner-login' || route === 'signup';
  const showFooter = route !== 'order' && !isDashboard && !isAuthPage;

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar darkMode={darkMode} toggleDark={toggleDark} />
          <main className="flex-1">
            {route === 'home' && <HomePage />}
            {route === 'menu' && <MenuPage />}
            {route === 'order' && <OrderPage />}
            {route === 'outlets' && <OutletsPage />}
            {route === 'about' && <AboutPage />}
            {route === 'login' && <LoginPage />}
            {route === 'customer-login' && <AuthPage mode="customer" />}
            {route === 'owner-login' && <AuthPage mode="owner" />}
            {route === 'signup' && <AuthPage mode="customer" />}
            {route === 'customer-dashboard' && <CustomerDashboard />}
            {route === 'owner-dashboard' && <OwnerDashboard />}
          </main>
          {showFooter && <Footer />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
