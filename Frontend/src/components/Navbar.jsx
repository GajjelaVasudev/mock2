import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = ({ deferredPrompt, isInstalled, handleInstallClick }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <nav className="navbar">
      <a href="/" className="nav-brand">
        <div className="brand-icon">E</div>
        <div className="brand-title">
          <h1>ETASHA Society</h1>
          <span>SkillSetu Platform</span>
        </div>
      </a>

      <div className="nav-actions">
        <LanguageSwitcher />
        
        <div className={`status-badge ${isOnline ? '' : 'offline'}`}>
          <span className="status-dot"></span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {deferredPrompt && !isInstalled && (
          <button className="btn-pwa-install" onClick={handleInstallClick}>
            <Download size={13} />
            <span>Install App</span>
          </button>
        )}
      </div>
    </nav>
  );
};
