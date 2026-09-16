import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { InstallPrompt } from './components/InstallPrompt';
import { LoginPage } from './components/LoginPage';
import { DashboardPreview } from './components/DashboardPreview';
import { TrainerDashboard } from './components/TrainerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';

export function App() {
  const { user } = useAuth();

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.warn('PWA Service Worker registration failed:', error);
          });
      });
    }

    // 2. Capture PWA Install Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 3. Detect Standalone / Installed mode
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navbar
        deferredPrompt={deferredPrompt}
        isInstalled={isInstalled}
        handleInstallClick={handleInstallClick}
      />

      {/* PWA Install Notification */}
      <InstallPrompt
        deferredPrompt={deferredPrompt}
        isInstalled={isInstalled}
        handleInstallClick={handleInstallClick}
        onDismiss={() => setPromptDismissed(true)}
        dismissed={promptDismissed}
      />

      {/* Main View Router */}
      <main className="main-wrapper">
        {!user ? (
          <LoginPage />
        ) : user.role === 'admin' ? (
          <AdminDashboard />
        ) : user.role === 'trainer' ? (
          <TrainerDashboard />
        ) : user.role === 'employer' ? (
          <EmployerDashboard />
        ) : (
          <DashboardPreview />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 ETASHA Society • Progressive Web App (PWA)</p>
      </footer>
    </div>
  );
}

export default App;
