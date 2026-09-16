import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Check } from 'lucide-react';

export const DashboardPreview = () => {
  const { user, logout } = useAuth();

  const profile = user?.softSkillsProfile || {
    confidenceScore: 78,
    communicationScore: 82,
    workplaceEtiquetteScore: 85,
    interviewReadinessScore: 74,
    attendanceRate: 92,
  };

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
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="profile-grid">
        <div className="info-item">
          <div className="info-label">Email / Contact</div>
          <div className="info-val">{user?.email || user?.phone || 'N/A'}</div>
        </div>

        <div className="info-item">
          <div className="info-label">Training Center</div>
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

      {user?.role === 'learner' && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Soft Skills Developmental Status
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="info-item">
              <div className="info-label">Attendance</div>
              <div className="info-val" style={{ color: (profile.attendanceRate || 85) < 75 ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
                {profile.attendanceRate !== undefined ? profile.attendanceRate : 85}%
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Confidence</div>
              <div className="info-val">{profile.confidenceScore}%</div>
            </div>
            <div className="info-item">
              <div className="info-label">Communication</div>
              <div className="info-val">{profile.communicationScore}%</div>
            </div>
            <div className="info-item">
              <div className="info-label">Workplace Ethics</div>
              <div className="info-val">{profile.workplaceEtiquetteScore}%</div>
            </div>
            <div className="info-item">
              <div className="info-label">Interview Ready</div>
              <div className="info-val">{profile.interviewReadinessScore}%</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#F3F4F6', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.2rem' }}>
          <Check size={14} />
          <span>Authenticated Account</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#4B5563' }}>
          Connected to ETASHA SkillSetu Progressive Web App.
        </p>
      </div>
    </div>
  );
};
