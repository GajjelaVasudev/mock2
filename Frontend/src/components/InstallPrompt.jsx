import React from 'react';
import { Download, X } from 'lucide-react';

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
        <span>Install ETASHA application for offline access</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {deferredPrompt && (
          <button className="btn-pwa-install" onClick={handleInstallClick}>
            <Download size={12} />
            <span>Install</span>
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '2px',
          }}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
