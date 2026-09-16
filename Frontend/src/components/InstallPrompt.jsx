import React from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const InstallPrompt = ({
  deferredPrompt,
  isInstalled,
  handleInstallClick,
  onDismiss,
  dismissed,
}) => {
  if (isInstalled || dismissed) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-text">
        <Smartphone size={18} color="#2563EB" />
        <span>Install ETASHA PWA on your device for fast, offline access</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {deferredPrompt && (
          <button className="btn-pwa-install" onClick={handleInstallClick}>
            <Download size={13} />
            <span>Install</span>
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '2px',
          }}
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
