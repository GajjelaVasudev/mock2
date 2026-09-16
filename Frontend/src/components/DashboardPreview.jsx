import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, MapPin, Building, GraduationCap, CheckCircle } from 'lucide-react';

export const DashboardPreview = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-card">
      <div className="dashboard-user-header">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <h3>{user?.name || 'User'}</h3>
            <span>{user?.role || 'Learner'}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="profile-grid">
        <div className="info-item">
          <div className="info-label">Email / Phone</div>
          <div className="info-val">{user?.email || user?.phone || 'N/A'}</div>
        </div>

        <div className="info-item">
          <div className="info-label">Center</div>
          <div className="info-val">{user?.center || 'Sangam Vihar CDC'}</div>
        </div>

        {user?.organization && (
          <div className="info-item">
            <div className="info-label">Organization</div>
            <div className="info-val">{user?.organization}</div>
          </div>
        )}

        {user?.batch && (
          <div className="info-item">
            <div className="info-label">Course / Batch</div>
            <div className="info-val">{user?.batch}</div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1E3A8A', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          <CheckCircle size={16} color="#2563EB" />
          <span>Authenticated via MongoDB Atlas</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569' }}>
          Welcome to ETASHA Society SkillSetu. You are successfully logged in to the Progressive Web App.
        </p>
      </div>
    </div>
  );
};
