import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import PaymentPage from './components/PaymentPage';
import InvoiceDashboard from './components/InvoiceDashboard';
import LoginPage from './components/LoginPage';

type ViewState = 'landing' | 'payment' | 'dashboard' | 'login';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has already paid/accessed the app
    const hasAccess = localStorage.getItem('invoicify_access');
    if (hasAccess === 'true') {
      setView('dashboard');
    }
    setLoading(false);
  }, []);

  const handlePaymentSuccess = () => {
    localStorage.setItem('invoicify_access', 'true');
    setView('dashboard');
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('invoicify_access', 'true');
    setView('dashboard');
  };

  const handleLogout = () => {
    // Optional: Clear access to reset flow for demo purposes
    // localStorage.removeItem('invoicify_access'); 
    setView('landing');
  };

  if (loading) return null;

  switch (view) {
    case 'landing':
      return (
        <LandingPage 
            onGetStarted={() => setView('payment')} 
            onLogin={() => setView('login')}
        />
      );
    case 'login':
      return (
        <LoginPage 
            onLoginSuccess={handleLoginSuccess} 
            onBack={() => setView('landing')}
        />
      );
    case 'payment':
      return <PaymentPage onPaymentSuccess={handlePaymentSuccess} />;
    case 'dashboard':
      return <InvoiceDashboard onLogout={handleLogout} />;
    default:
      return (
        <LandingPage 
            onGetStarted={() => setView('payment')} 
            onLogin={() => setView('login')}
        />
      );
  }
};

export default App;