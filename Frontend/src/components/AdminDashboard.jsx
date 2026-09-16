import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Building,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  FileText,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  LogOut,
  Printer,
  Download,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // Active Tab Navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Data
  const [overview, setOverview] = useState({
    totalUsers: 12,
    studentsCount: 8,
    trainersCount: 2,
    employersCount: 2,
    centersCount: 4,
    activeCohortsCount: 3,
    placedCount: 3,
    placementRate: 75,
    atRiskCount: 3,
    avgAttendance: 83,
    overallImpactTrained: 38450,
    overallImpactLives: 200000,
  });

  // Data Collections
  const [usersList, setUsersList] = useState([]);
  const [centersList, setCentersList] = useState([]);
  const [cohortsList, setCohortsList] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [progressionStats, setProgressionStats] = useState([]);
  const [placementsList, setPlacementsList] = useState([]);
  const [impactReport, setImpactReport] = useState(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form States
  // 1. New User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('learner');
  const [newUserCenter, setNewUserCenter] = useState('Sangam Vihar CDC');

  // 2. New Center Form
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterLocation, setNewCenterLocation] = useState('');
  const [newCenterLead, setNewCenterLead] = useState('Sunita Sharma');
  const [newCenterCapacity, setNewCenterCapacity] = useState(60);

  // 3. New Cohort Form
  const [newCohortName, setNewCohortName] = useState('');
  const [newCohortCourse, setNewCohortCourse] = useState('Retail & Workplace Soft Skills Readiness');
  const [newCohortCenter, setNewCohortCenter] = useState('Sangam Vihar CDC');
  const [newCohortTrainer, setNewCohortTrainer] = useState('Sunita Sharma');

  // 4. New Placement Form
  const [placeStudentName, setPlaceStudentName] = useState('');
  const [placeEmployer, setPlaceEmployer] = useState('');
  const [placeRole, setPlaceRole] = useState('Frontline Customer Associate');
  const [placeSector, setPlaceSector] = useState('Retail');
  const [placeSalary, setPlaceSalary] = useState(16500);

  // Notifications
  const [notification, setNotification] = useState('');
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Fetch All Admin Data
  const fetchAdminData = async () => {
    try {
      // 1. Overview
      const ovRes = await fetch('/api/admin/overview');
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        if (ovData.data) setOverview(ovData.data);
      }

      // 2. Users
      const uRes = await fetch('/api/admin/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.users) setUsersList(uData.users);
      }

      // 3. Centers
      const cRes = await fetch('/api/admin/centers');
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.centers) setCentersList(cData.centers);
      }

      // 4. Cohorts
      const coRes = await fetch('/api/admin/cohorts');
      if (coRes.ok) {
        const coData = await coRes.json();
        if (coData.cohorts) setCohortsList(coData.cohorts);
      }

      // 5. Enrollment & Attendance
      const eaRes = await fetch('/api/admin/enrollment-attendance');
      if (eaRes.ok) {
        const eaData = await eaRes.json();
        if (eaData.stats) setAttendanceStats(eaData.stats);
      }

      // 6. Skill Progression
      const skRes = await fetch('/api/admin/skill-progression');
      if (skRes.ok) {
        const skData = await skRes.json();
        if (skData.progression) setProgressionStats(skData.progression);
      }

      // 7. Placements
      const plRes = await fetch('/api/admin/placements');
      if (plRes.ok) {
        const plData = await plRes.json();
        if (plData.placements) setPlacementsList(plData.placements);
      }

      // 8. Impact Report
      const irRes = await fetch('/api/admin/impact-report');
      if (irRes.ok) {
        const irData = await irRes.json();
        if (irData.report) setImpactReport(irData.report);
      }
    } catch (err) {
      console.warn('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handlers
  // 1. Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || (!newUserEmail.trim() && !newUserPhone.trim())) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          phone: newUserPhone.trim(),
          role: newUserRole,
          center: newUserCenter,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`User ${newUserName} created successfully.`);
        setShowUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        fetchAdminData();
      } else {
        showNotification(data.message || 'Error creating user.');
      }
    } catch (err) {
      showNotification('Error creating user.');
    }
  };

  // 2. Change Role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      showNotification(`Role updated to ${newRole}.`);
      fetchAdminData();
    } catch (err) {
      showNotification('Error updating role.');
    }
  };

  // 3. Delete User
  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      showNotification(`User ${name} removed.`);
      fetchAdminData();
    } catch (err) {
      showNotification('Error deleting user.');
    }
  };

  // 4. Create Center
  const handleCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenterName.trim()) return;

    try {
      const res = await fetch('/api/admin/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCenterName.trim(),
          location: newCenterLocation.trim() || newCenterName.trim(),
          leadTrainer: newCenterLead,
          capacity: Number(newCenterCapacity),
        }),
      });
      if (res.ok) {
        showNotification(`Center "${newCenterName}" registered.`);
        setNewCenterName('');
        setNewCenterLocation('');
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Error creating center.');
    }
  };

  // 5. Delete Center
  const handleDeleteCenter = async (centerId, name) => {
    if (!confirm(`Are you sure you want to remove center "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/centers/${centerId}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Center "${name}" removed.`);
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Error removing center.');
    }
  };

  // 6. Create Cohort
  const handleCreateCohort = async (e) => {
    e.preventDefault();
    if (!newCohortName.trim()) return;

    try {
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCohortName.trim(),
          courseName: newCohortCourse,
          center: newCohortCenter,
          trainerName: newCohortTrainer,
        }),
      });
      if (res.ok) {
        showNotification(`Cohort "${newCohortName}" created.`);
        setNewCohortName('');
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Error creating cohort.');
    }
  };

  // 7. Delete Cohort
  const handleDeleteCohort = async (cohortId, name) => {
    if (!confirm(`Are you sure you want to remove cohort "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/cohorts/${cohortId}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Cohort "${name}" removed.`);
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Error removing cohort.');
    }
  };

  // 8. Record Placement
  const handleRecordPlacement = async (e) => {
    e.preventDefault();
    if (!placeStudentName.trim() || !placeEmployer.trim()) return;

    try {
      const res = await fetch('/api/admin/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: placeStudentName.trim(),
          employerName: placeEmployer.trim(),
          roleTitle: placeRole,
          sector: placeSector,
          monthlySalary: Number(placeSalary),
        }),
      });
      if (res.ok) {
        showNotification(`Placement recorded for ${placeStudentName}!`);
        setPlaceStudentName('');
        setPlaceEmployer('');
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Error recording placement.');
    }
  };

  // 9. Delete Placement
  const handleDeletePlacement = async (placementId, studentName) => {
    if (!confirm(`Are you sure you want to remove placement record for "${studentName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/placements/${placementId}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Placement record removed.`);
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Error removing placement record.');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);
    return matchRole && matchSearch;
  });

  // Filter At-Risk Learners
  const atRiskLearners = usersList.filter(
    (u) =>
      u.role === 'learner' &&
      ((u.softSkillsProfile?.attendanceRate || 85) < 75 || (u.softSkillsProfile?.confidenceScore || 65) < 60)
  );

  return (
    <div className="trainer-dashboard">
      {/* Header */}
      <div className="trainer-header">
        <div className="trainer-title-area">
          <div className="trainer-avatar">A</div>
          <div>
            <h2>Program Leadership & Management Portal</h2>
            <div className="trainer-badges">
              <span className="pill-badge primary">Program Director</span>
              <span className="pill-badge">ETASHA Central HQ</span>
              <span className="pill-badge">CSR & M&E Monitoring</span>
            </div>
          </div>
        </div>

        <button className="btn-logout" onClick={logout}>
          <LogOut size={14} />
          <span>{t('dashboards.logout')}</span>
        </button>
      </div>

      {notification && (
        <div className="trainer-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="trainer-tabs">
        <button
          className={`trainer-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>{t('dashboards.overview')}</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={14} />
          <span>Users & Roles ({usersList.length})</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'centers' ? 'active' : ''}`}
          onClick={() => setActiveTab('centers')}
        >
          <Building size={14} />
          <span>Training Centers ({centersList.length})</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'cohorts' ? 'active' : ''}`}
          onClick={() => setActiveTab('cohorts')}
        >
          <GraduationCap size={14} />
          <span>Courses & Cohorts ({cohortsList.length})</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <CalendarCheck size={14} />
          <span>Enrollment & Attendance</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'progression' ? 'active' : ''}`}
          onClick={() => setActiveTab('progression')}
        >
          <TrendingUp size={14} />
          <span>Skill Progression</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'dropout' ? 'active' : ''}`}
          onClick={() => setActiveTab('dropout')}
        >
          <AlertTriangle size={14} />
          <span>Dropout Alerts ({atRiskLearners.length})</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'placements' ? 'active' : ''}`}
          onClick={() => setActiveTab('placements')}
        >
          <Briefcase size={14} />
          <span>Placements ({placementsList.length})</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <FileText size={14} />
          <span>Impact Report</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Active Enrolled Trainees</div>
              <div className="kpi-val">{overview.studentsCount}</div>
              <div className="kpi-sub">Across 4 Community Centers</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Placement Rate</div>
              <div className="kpi-val">{overview.placementRate}%</div>
              <div className="kpi-sub">Benchmark: 75%–80% Target</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Total Historical Impact</div>
              <div className="kpi-val">38,450+</div>
              <div className="kpi-sub">200,000+ Family Lives Impacted</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Active Training Centers</div>
              <div className="kpi-val">{overview.centersCount}</div>
              <div className="kpi-sub">Sangam Vihar, Khanpur, Dakshinpuri, Mangolpuri</div>
            </div>
          </div>

          <div className="trainer-panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">Program Management Quick Actions</h3>
            <div className="quick-actions-row">
              <button className="btn-action-tile" onClick={() => setActiveTab('users')}>
                <Users size={18} />
                <strong>Manage System Users</strong>
                <span>Assign and promote roles across portal</span>
              </button>

              <button className="btn-action-tile" onClick={() => setActiveTab('attendance')}>
                <CalendarCheck size={18} />
                <strong>Review Center Attendance</strong>
                <span>Inspect cohort averages vs 80% benchmark</span>
              </button>

              <button className="btn-action-tile" onClick={() => setActiveTab('placements')}>
                <Briefcase size={18} />
                <strong>Track Placements</strong>
                <span>Log hired graduates and starting salaries</span>
              </button>

              <button className="btn-action-tile" onClick={() => setActiveTab('report')}>
                <FileText size={18} />
                <strong>Generate CSR Impact Report</strong>
                <span>Donor evaluation and governance metrics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MANAGE USERS & ROLES
          ========================================================================= */}
      {activeTab === 'users' && (
        <div className="trainer-panel">
          <div className="panel-header-flex">
            <div>
              <h3 className="panel-title">User Management & Role Governance</h3>
              <p className="panel-sub">Manage accounts, change permissions, and assign community centers</p>
            </div>

            <div className="filter-controls">
              <div className="search-input-box">
                <Search size={14} color="#6B7280" />
                <input
                  type="text"
                  placeholder="Search user name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="learner">Learners / Trainees</option>
                <option value="trainer">Trainers / Faculty</option>
                <option value="employer">Employer Partners</option>
                <option value="admin">Administrators</option>
              </select>

              <button className="btn-secondary-sm" onClick={() => setShowUserModal(!showUserModal)}>
                <Plus size={14} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Add User Form Drawer */}
          {showUserModal && (
            <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #E5E7EB' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.65rem' }}>Create New Account</div>
              <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Phone number"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                />
                <select
                  className="form-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="learner">Learner</option>
                  <option value="trainer">Trainer</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  className="form-select"
                  value={newUserCenter}
                  onChange={(e) => setNewUserCenter(e.target.value)}
                >
                  <option value="Sangam Vihar CDC">Sangam Vihar CDC</option>
                  <option value="Khanpur CDC">Khanpur CDC</option>
                  <option value="Dakshinpuri CDC">Dakshinpuri CDC</option>
                  <option value="Mangolpuri CDC">Mangolpuri CDC</option>
                  <option value="Central HQ">Central HQ</option>
                </select>
                <button type="submit" className="btn-primary" style={{ marginTop: 0 }}>
                  Save User
                </button>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="table-responsive">
            <table className="trainer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Assigned Center</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const uId = u._id || u.id;
                  return (
                    <tr key={uId}>
                      <td>
                        <strong>{u.name}</strong>
                        {u.organization && (
                          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{u.organization}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem' }}>{u.phone || 'N/A'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{u.email}</div>
                      </td>
                      <td>{u.center || 'Central HQ'}</td>
                      <td>
                        <select
                          className="filter-select"
                          value={u.role}
                          onChange={(e) => handleRoleChange(uId, e.target.value)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <option value="learner">Learner</option>
                          <option value="trainer">Trainer</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}
                          onClick={() => handleDeleteUser(uId, u.name)}
                          title="Remove user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MANAGE TRAINING CENTERS
          ========================================================================= */}
      {activeTab === 'centers' && (
        <div className="tasks-layout-grid">
          {/* Centers List */}
          <div className="trainer-panel">
            <h3 className="panel-title">Active Community Development Centers ({centersList.length})</h3>
            <p className="panel-sub">Ground-level training delivery locations across Delhi and NCR</p>

            <div className="tasks-stack" style={{ marginTop: '0.85rem' }}>
              {centersList.map((c) => {
                const cId = c._id || c.id;
                return (
                  <div key={cId || c.name} className="task-item-card">
                    <div className="task-item-header">
                      <strong>{c.name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="task-category-tag">Capacity: {c.capacity}</span>
                        {cId && (
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                            onClick={() => handleDeleteCenter(cId, c.name)}
                            title="Remove center"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="task-desc-text">{c.address || c.location}</p>
                    <div className="task-item-footer">
                      <span>Lead Facilitator: {c.leadTrainer}</span>
                      <span>Enrolled: <strong>{c.enrolledLearners !== undefined ? c.enrolledLearners : 0} Trainees</strong></span>
                      <span>Batches: <strong>{c.activeBatchesCount || 1}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Center Form */}
          <div className="trainer-panel">
            <h3 className="panel-title">Register New Center</h3>
            <p className="panel-sub">Expand training footprint to partner ITIs or new CDCs</p>

            <form onSubmit={handleCreateCenter} style={{ marginTop: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Center Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Okhla Phase 2 CDC"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Area</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. South-East Delhi"
                  value={newCenterLocation}
                  onChange={(e) => setNewCenterLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Trainer Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newCenterLead}
                  onChange={(e) => setNewCenterLead(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Learner Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  value={newCenterCapacity}
                  onChange={(e) => setNewCenterCapacity(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">
                Register Center
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MANAGE COURSES & COHORTS
          ========================================================================= */}
      {activeTab === 'cohorts' && (
        <div className="tasks-layout-grid">
          <div className="trainer-panel">
            <h3 className="panel-title">Active Batches & Cohorts ({cohortsList.length})</h3>
            <p className="panel-sub">Structured short-term soft skills & domain readiness cohorts</p>

            <div className="tasks-stack" style={{ marginTop: '0.85rem' }}>
              {cohortsList.map((co) => {
                const coId = co._id || co.id;
                return (
                  <div key={coId || co.name} className="task-item-card">
                    <div className="task-item-header">
                      <strong>{co.name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="task-category-tag">{co.status || 'active'}</span>
                        {coId && (
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                            onClick={() => handleDeleteCohort(coId, co.name)}
                            title="Remove cohort"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="task-desc-text"><strong>Course:</strong> {co.courseName}</p>
                    <div className="task-item-footer">
                      <span>Center: {co.center}</span>
                      <span>Trainer: {co.trainerName}</span>
                      <span>Enrolled: <strong>{co.enrolledCount !== undefined ? co.enrolledCount : 0}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="trainer-panel">
            <h3 className="panel-title">Launch New Cohort</h3>
            <p className="panel-sub">Create a new batch for upcoming trainee admissions</p>

            <form onSubmit={handleCreateCohort} style={{ marginTop: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Cohort Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Batch 2026-D"
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Program</label>
                <select
                  className="form-select"
                  value={newCohortCourse}
                  onChange={(e) => setNewCohortCourse(e.target.value)}
                >
                  <option value="Retail & Workplace Soft Skills Readiness">Retail & Workplace Soft Skills Readiness</option>
                  <option value="BPO & Digital Communication Skills">BPO & Digital Communication Skills</option>
                  <option value="Customer Care & Front Office Operations">Customer Care & Front Office Operations</option>
                  <option value="Computerized Accounting & Tally">Computerized Accounting & Tally</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Training Center</label>
                <select
                  className="form-select"
                  value={newCohortCenter}
                  onChange={(e) => setNewCohortCenter(e.target.value)}
                >
                  {centersList.length > 0 ? (
                    centersList.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Sangam Vihar CDC">Sangam Vihar CDC</option>
                      <option value="Khanpur CDC">Khanpur CDC</option>
                      <option value="Dakshinpuri CDC">Dakshinpuri CDC</option>
                      <option value="Mangolpuri CDC">Mangolpuri CDC</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Faculty</label>
                <input
                  type="text"
                  className="form-input"
                  value={newCohortTrainer}
                  onChange={(e) => setNewCohortTrainer(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">
                Launch Cohort
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ENROLLMENT & ATTENDANCE MONITORING
          ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="trainer-panel">
          <h3 className="panel-title">Center-Level Enrollment & Attendance Monitoring</h3>
          <p className="panel-sub">Continuous monitoring against the 80% minimum attendance threshold for job placement</p>

          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="trainer-table">
              <thead>
                <tr>
                  <th>Training Center</th>
                  <th>Enrolled Trainees</th>
                  <th>Avg Attendance</th>
                  <th>Attendance Target</th>
                  <th>At-Risk Count</th>
                  <th>Center Health</th>
                </tr>
              </thead>
              <tbody>
                {attendanceStats.map((st) => (
                  <tr key={st.center}>
                    <td><strong>{st.center}</strong></td>
                    <td>{st.enrolledCount} Students</td>
                    <td>
                      <span className="score-badge">{st.avgAttendanceRate}%</span>
                    </td>
                    <td>{st.targetAttendance}% Minimum</td>
                    <td>
                      {st.atRiskCount > 0 ? (
                        <span className="risk-pill danger">{st.atRiskCount} Flagged</span>
                      ) : (
                        <span className="risk-pill">0 Flagged</span>
                      )}
                    </td>
                    <td>
                      {st.avgAttendanceRate >= 80 ? (
                        <span className="risk-pill">On Track</span>
                      ) : (
                        <span className="risk-pill danger">Needs Attention</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SKILL PROGRESSION (CSR IMPACT BREAKDOWN)
          ========================================================================= */}
      {activeTab === 'progression' && (
        <div className="trainer-panel">
          <h3 className="panel-title">Soft Skills Developmental Progression (Baseline vs Endline)</h3>
          <p className="panel-sub">Measurable developmental growth tracking across core soft skill competencies</p>

          <div className="progress-metrics-list" style={{ marginTop: '1rem' }}>
            {progressionStats.map((pr) => (
              <div key={pr.competency} className="student-progress-card">
                <div className="sp-header">
                  <strong>{pr.competency}</strong>
                  <div className="overall-score-pill">
                    Baseline: {pr.baselineScore}% &rarr; Current: <strong>{pr.currentScore}%</strong> (Target: {pr.targetScore}%)
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="sp-label">
                    <span>Measured Growth (+{pr.currentScore - pr.baselineScore}% Improvement)</span>
                    <span>{pr.currentScore}%</span>
                  </div>
                  <div className="prog-track" style={{ height: '8px' }}>
                    <div className="prog-fill" style={{ width: `${pr.currentScore}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: DROPOUT ALERTS
          ========================================================================= */}
      {activeTab === 'dropout' && (
        <div className="trainer-panel">
          <h3 className="panel-title">Active Dropout Early-Warning Signals</h3>
          <p className="panel-sub">Centralized alert list for all trainees flagged with low attendance or lagging confidence</p>

          <div className="at-risk-grid" style={{ marginTop: '1rem' }}>
            {atRiskLearners.map((st) => (
              <div key={st._id || st.id} className="at-risk-card">
                <div className="at-risk-header">
                  <div>
                    <h4>{st.name}</h4>
                    <span className="at-risk-meta">{st.center || 'Sangam Vihar CDC'} • {st.batch || 'Batch 2026-A'}</span>
                  </div>
                  <span className="risk-indicator-pill">Dropout Risk</span>
                </div>

                <div className="risk-reason-box">
                  <strong>Risk Trigger:</strong>
                  <p>Attendance is {st.softSkillsProfile?.attendanceRate !== undefined ? st.softSkillsProfile.attendanceRate : 68}% (Below 75% threshold)</p>
                </div>

                <div className="risk-metrics-row">
                  <div><span>Attendance: </span><strong>{st.softSkillsProfile?.attendanceRate !== undefined ? st.softSkillsProfile.attendanceRate : 68}%</strong></div>
                  <div><span>Confidence: </span><strong>{st.softSkillsProfile?.confidenceScore || 52}%</strong></div>
                  <div><span>Contact: </span><strong>{st.phone || 'N/A'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: PLACEMENTS TRACKING
          ========================================================================= */}
      {activeTab === 'placements' && (
        <div className="tasks-layout-grid">
          <div className="trainer-panel">
            <h3 className="panel-title">Placed Graduates Roster ({placementsList.length})</h3>
            <p className="panel-sub">Verification of organized-sector entry-level employment</p>

            <div className="table-responsive" style={{ marginTop: '0.85rem' }}>
              <table className="trainer-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Employer & Role</th>
                    <th>Sector</th>
                    <th>Monthly Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {placementsList.map((p) => {
                    const pId = p._id || p.id;
                    return (
                      <tr key={pId || p.studentName}>
                        <td><strong>{p.studentName}</strong></td>
                        <td>
                          <div>{p.employerName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{p.roleTitle}</div>
                        </td>
                        <td>{p.sector}</td>
                        <td><strong>INR {p.monthlySalary ? p.monthlySalary.toLocaleString() : 'N/A'}/mo</strong></td>
                        <td>
                          {pId && (
                            <button
                              style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                              onClick={() => handleDeletePlacement(pId, p.studentName)}
                              title="Remove placement"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="trainer-panel">
            <h3 className="panel-title">Log New Placement</h3>
            <p className="panel-sub">Record candidate hiring details and starting compensation</p>

            <form onSubmit={handleRecordPlacement} style={{ marginTop: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kavita Singh"
                  value={placeStudentName}
                  onChange={(e) => setPlaceStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employer Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Retail Partners"
                  value={placeEmployer}
                  onChange={(e) => setPlaceEmployer(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Role Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={placeRole}
                  onChange={(e) => setPlaceRole(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry Sector</label>
                <select
                  className="form-select"
                  value={placeSector}
                  onChange={(e) => setPlaceSector(e.target.value)}
                >
                  <option value="Retail">Organized Retail</option>
                  <option value="Hospitality">Hospitality & Food Services</option>
                  <option value="BPO / Customer Service">BPO & Tele-services</option>
                  <option value="Computerized Accounting">Computerized Accounting</option>
                  <option value="Front Office & Admin">Front Office & Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Starting Monthly Salary (INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={placeSalary}
                  onChange={(e) => setPlaceSalary(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Confirm Placement Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 9: IMPACT REPORT (CSR / DONOR READY)
          ========================================================================= */}
      {activeTab === 'report' && impactReport && (
        <div className="trainer-panel">
          <div className="panel-header-flex">
            <div>
              <h3 className="panel-title">{impactReport.reportTitle}</h3>
              <p className="panel-sub">{impactReport.organization} • Generated: {impactReport.generatedDate}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-secondary-sm"
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(impactReport, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `ETASHA_CSR_Report_${new Date().toISOString().slice(0,10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
              <button className="btn-secondary-sm" onClick={() => window.print()}>
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#F3F4F6', padding: '1.25rem', borderRadius: '6px', marginTop: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Executive Summary</div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#374151', marginBottom: '0.85rem' }}>
              {impactReport.executiveSummary.mission}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="info-item">
                <div className="info-label">Historical Trained</div>
                <div className="info-val">{impactReport.executiveSummary.totalHistoricalImpact}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Placement Rate</div>
                <div className="info-val">{impactReport.executiveSummary.placementRate}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Average Starting Salary</div>
                <div className="info-val">{impactReport.executiveSummary.averageStartingSalary}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Sector-Wise Employment Distribution</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              {impactReport.sectorDistribution.map((sec) => (
                <div key={sec.sector} className="info-item">
                  <div className="info-label">{sec.sector}</div>
                  <div className="info-val">{sec.percentage}% of Hires</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #E5E7EB', paddingTop: '0.85rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Funding & Governance Partners</div>
            <ul style={{ fontSize: '0.8rem', color: '#4B5563', paddingLeft: '1.25rem' }}>
              {impactReport.keyFundersAndPartners.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
