import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  Search,
  CheckCircle,
  Clock,
  Award,
  Calendar,
  Building,
  Filter,
  Eye,
  UserPlus,
  ArrowRight,
  TrendingUp,
  FileText,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  LogOut,
} from 'lucide-react';

export const EmployerDashboard = () => {
  const { user, logout } = useAuth();

  // Active Tab Navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Overview & Company Data
  const [company, setCompany] = useState({
    name: 'Apex Retail Partners',
    contactPerson: 'Rajesh Mehra',
    email: 'rajesh.employer@etasha.org',
    phone: '+91 98102 33445',
    industry: 'Organized Retail & Customer Care',
    hiringTarget: 30,
    openPositions: [
      { title: 'Customer Sales Associate', openings: 15, minSalary: 16000 },
      { title: 'Frontline Cashier & Billing', openings: 8, minSalary: 15500 },
      { title: 'Store Inventory Assistant', openings: 5, minSalary: 17000 },
    ],
  });

  const [metrics, setMetrics] = useState({
    totalGraduates: 9,
    shortlistedCount: 1,
    interviewCount: 1,
    offeredCount: 1,
    hiredCount: 1,
    conversionRate: 11,
  });

  // Candidate Data & Pipeline
  const [graduates, setGraduates] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [centerFilter, setCenterFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Candidate for Deep Profile Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Stage Action Modals
  const [stageModal, setStageModal] = useState(null); // { candidate, targetStage, pipelineId }
  const [modalSalary, setModalSalary] = useState(16500);
  const [modalRole, setModalRole] = useState('Customer Sales Associate');
  const [modalDate, setModalDate] = useState('2026-03-25');
  const [modalTime, setModalTime] = useState('11:00 AM');
  const [modalNotes, setModalNotes] = useState('');

  // Notifications
  const [notification, setNotification] = useState('');
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // 1. Fetch Employer Profile & Pipeline
  const fetchProfileAndMetrics = async () => {
    try {
      const res = await fetch('/api/employer/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.company) setCompany(data.company);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn('Error fetching employer profile:', err);
    }
  };

  // 2. Fetch Graduates with Filters
  const fetchGraduates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (centerFilter !== 'all') params.append('center', centerFilter);
      if (badgeFilter !== 'all') params.append('badge', badgeFilter);
      if (minScoreFilter) params.append('minScore', minScoreFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/employer/graduates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.graduates) setGraduates(data.graduates);
      }
    } catch (err) {
      console.warn('Error fetching graduates:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Pipeline
  const fetchPipeline = async () => {
    try {
      const res = await fetch('/api/employer/pipeline');
      if (res.ok) {
        const data = await res.json();
        if (data.pipeline) setPipeline(data.pipeline);
      }
    } catch (err) {
      console.warn('Error fetching pipeline:', err);
    }
  };

  useEffect(() => {
    fetchProfileAndMetrics();
    fetchGraduates();
    fetchPipeline();
  }, []);

  // Trigger search on filter changes
  useEffect(() => {
    fetchGraduates();
  }, [searchTerm, centerFilter, badgeFilter, minScoreFilter, statusFilter]);

  // 4. View Candidate Deep Profile
  const handleOpenCandidateModal = async (candidate) => {
    setSelectedCandidate(candidate);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/employer/candidates/${candidate._id}`);
      if (res.ok) {
        const data = await res.json();
        setCandidateDetails(data);
      }
    } catch (err) {
      console.warn('Error fetching candidate details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 5. Shortlist Candidate
  const handleShortlist = async (candidateId, candidateName) => {
    try {
      const res = await fetch('/api/employer/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          roleApplied: 'Customer Sales Associate',
          offeredSalary: 16500,
          notes: 'Candidate shortlisted from ETASHA Graduate Pool.',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`${candidateName} added to Hiring Pipeline.`);
        fetchProfileAndMetrics();
        fetchGraduates();
        fetchPipeline();
        if (selectedCandidate) {
          setSelectedCandidate(null);
        }
      } else {
        showNotification(data.message || 'Error shortlisting candidate.');
      }
    } catch (err) {
      showNotification('Network error while shortlisting candidate.');
    }
  };

  // 6. Move Pipeline Stage
  const handleStageSubmit = async (e) => {
    e.preventDefault();
    if (!stageModal) return;

    try {
      const { pipelineId, targetStage } = stageModal;
      const body = {
        stage: targetStage,
        roleApplied: modalRole,
        notes: modalNotes,
      };

      if (targetStage === 'interview_scheduled') {
        body.interviewDate = modalDate;
        body.interviewTime = modalTime;
      } else if (targetStage === 'offered' || targetStage === 'hired') {
        body.offeredSalary = Number(modalSalary);
        body.employerName = company.name;
      }

      const res = await fetch(`/api/employer/pipeline/${pipelineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        if (targetStage === 'hired') {
          showNotification(`Candidate successfully hired at INR ${modalSalary}/mo. Placement synchronized with Admin & Program Manager records.`);
        } else {
          showNotification(`Candidate moved to stage: ${targetStage.replace('_', ' ').toUpperCase()}.`);
        }
        setStageModal(null);
        fetchProfileAndMetrics();
        fetchGraduates();
        fetchPipeline();
      } else {
        showNotification(data.message || 'Error updating stage.');
      }
    } catch (err) {
      showNotification('Network error updating hiring stage.');
    }
  };

  // 7. Update Company Profile
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          contactPerson: company.contactPerson,
          industry: company.industry,
          phone: company.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Company profile and recruitment preferences saved.');
      } else {
        showNotification(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      showNotification('Error updating company profile.');
    }
  };

  // Pipeline stage groups
  const pipelineStages = [
    { id: 'shortlisted', title: 'Shortlisted' },
    { id: 'interview_scheduled', title: 'Interview Scheduled' },
    { id: 'offered', title: 'Offer Extended' },
    { id: 'hired', title: 'Hired & Placed' },
  ];

  return (
    <div className="portal-container">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification">
          <div className="toast-icon">
            <Check size={16} />
          </div>
          <div className="toast-message">{notification}</div>
          <button className="toast-close" onClick={() => setNotification('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="header-badge">
            <Briefcase size={14} />
            <span>EMPLOYER & RECRUITER PORTAL</span>
          </div>
          <h1 className="portal-title">{company.name}</h1>
          <p className="portal-subtitle">
            Hiring Partner • Lead Recruiter: {company.contactPerson} • {company.industry}
          </p>
        </div>
        <div className="portal-header-right">
          <div className="user-profile-summary">
            <span className="user-role-tag">Employer</span>
            <span className="user-name-display">{user?.name || company.contactPerson}</span>
          </div>
          <button className="btn btn-outline" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="portal-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={16} />
          <span>Overview</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'graduates' ? 'active' : ''}`}
          onClick={() => setActiveTab('graduates')}
        >
          <Users size={16} />
          <span>Graduate Talent Pool ({graduates.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <Briefcase size={16} />
          <span>Hiring Pipeline ({pipeline.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <Building size={16} />
          <span>Company Profile</span>
        </button>
      </nav>

      {/* TAB 1: OVERVIEW & FUNNEL METRICS */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Available Graduates</span>
                <Users size={18} />
              </div>
              <div className="metric-value">{metrics.totalGraduates}</div>
              <div className="metric-caption">ETASHA Certified Candidates</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Shortlisted Candidates</span>
                <Eye size={18} />
              </div>
              <div className="metric-value">{metrics.shortlistedCount}</div>
              <div className="metric-caption">In Active Review</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Interviews Scheduled</span>
                <Calendar size={18} />
              </div>
              <div className="metric-value">{metrics.interviewCount}</div>
              <div className="metric-caption">Evaluations In Progress</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Offers Extended</span>
                <Award size={18} />
              </div>
              <div className="metric-value">{metrics.offeredCount}</div>
              <div className="metric-caption">Letters Generated</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Confirmed Hires</span>
                <CheckCircle size={18} />
              </div>
              <div className="metric-value">{metrics.hiredCount}</div>
              <div className="metric-caption">Placed & Synced Live</div>
            </div>
          </div>

          {/* Hiring Funnel Breakdown */}
          <div className="grid-2-col" style={{ marginTop: '24px' }}>
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Active Job Requisitions</h2>
                <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('company')}>
                  Manage Openings
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Role</th>
                      <th>Openings</th>
                      <th>Starting Salary</th>
                      <th>Target Center</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.openPositions?.map((pos, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{pos.title}</td>
                        <td>{pos.openings} Positions</td>
                        <td>INR {pos.minSalary.toLocaleString()} /mo</td>
                        <td>Sangam Vihar & Khanpur CDCs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Hiring Pipeline Summary</h2>
                <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('pipeline')}>
                  View Pipeline
                </button>
              </div>
              <div className="funnel-container">
                <div className="funnel-step">
                  <div className="funnel-step-header">
                    <span>1. Shortlisted Candidates</span>
                    <span className="font-bold">{metrics.shortlistedCount}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (metrics.shortlistedCount / 5) * 100)}%` }} />
                  </div>
                </div>

                <div className="funnel-step" style={{ marginTop: '14px' }}>
                  <div className="funnel-step-header">
                    <span>2. Interviews Scheduled</span>
                    <span className="font-bold">{metrics.interviewCount}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (metrics.interviewCount / 5) * 100)}%` }} />
                  </div>
                </div>

                <div className="funnel-step" style={{ marginTop: '14px' }}>
                  <div className="funnel-step-header">
                    <span>3. Offers Extended</span>
                    <span className="font-bold">{metrics.offeredCount}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (metrics.offeredCount / 5) * 100)}%` }} />
                  </div>
                </div>

                <div className="funnel-step" style={{ marginTop: '14px' }}>
                  <div className="funnel-step-header">
                    <span>4. Placed & Onboarded</span>
                    <span className="font-bold">{metrics.hiredCount}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (metrics.hiredCount / 5) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRADUATE TALENT POOL & SEARCH */}
      {activeTab === 'graduates' && (
        <div className="tab-content">
          {/* Filters Bar */}
          <div className="filters-card">
            <div className="filters-grid">
              <div className="filter-item search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search candidate name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-item">
                <select
                  value={centerFilter}
                  onChange={(e) => setCenterFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Training Centers</option>
                  <option value="Sangam Vihar CDC">Sangam Vihar CDC</option>
                  <option value="Khanpur CDC">Khanpur CDC</option>
                  <option value="Dakshinpuri CDC">Dakshinpuri CDC</option>
                  <option value="Mangolpuri CDC">Mangolpuri CDC</option>
                </select>
              </div>

              <div className="filter-item">
                <select
                  value={badgeFilter}
                  onChange={(e) => setBadgeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Skill Badges</option>
                  <option value="Active Communicator">Active Communicator</option>
                  <option value="Punctuality Star">Punctuality Star</option>
                  <option value="Customer Delight Champion">Customer Delight Champion</option>
                  <option value="Retail Ready">Retail Ready</option>
                </select>
              </div>

              <div className="filter-item">
                <select
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any Confidence Score</option>
                  <option value="80">Confidence &gt;= 80%</option>
                  <option value="70">Confidence &gt;= 70%</option>
                  <option value="60">Confidence &gt;= 60%</option>
                </select>
              </div>

              <div className="filter-item">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Pipeline Stages</option>
                  <option value="available">Available in Pool</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="offered">Offer Extended</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          {loading ? (
            <div className="empty-state-box">Loading graduate candidate profiles...</div>
          ) : graduates.length === 0 ? (
            <div className="empty-state-box">No candidates found matching the selected filters.</div>
          ) : (
            <div className="candidates-grid">
              {graduates.map((cand) => {
                const confScore = cand.softSkillsProfile?.confidenceScore || 65;
                const commScore = cand.softSkillsProfile?.communicationScore || 70;
                const badges = cand.softSkillsProfile?.badgesEarned || ['Active Communicator'];
                const stage = cand.pipelineStage || 'available';

                return (
                  <div key={cand._id} className="candidate-card">
                    <div className="candidate-card-header">
                      <div>
                        <h3 className="candidate-name">{cand.name}</h3>
                        <div className="candidate-meta">
                          <MapPin size={12} />
                          <span>{cand.center}</span> • <span>{cand.batch}</span>
                        </div>
                      </div>
                      <div className="candidate-stage-badge">
                        {stage === 'available' ? 'Available' : stage.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>

                    <div className="candidate-badges-row">
                      {badges.map((b, i) => (
                        <span key={i} className="skill-badge-tag">
                          <Award size={12} />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>

                    {/* Competency Score Bars */}
                    <div className="candidate-scores">
                      <div className="score-row">
                        <span>Confidence & Mindset</span>
                        <span className="font-bold">{confScore}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${confScore}%` }} />
                      </div>

                      <div className="score-row" style={{ marginTop: '8px' }}>
                        <span>Spoken English & Communication</span>
                        <span className="font-bold">{commScore}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${commScore}%` }} />
                      </div>
                    </div>

                    {/* Trainer Endorsement Snippet */}
                    <div className="trainer-note-preview">
                      <p className="note-text">
                        "{cand.softSkillsProfile?.trainerNotes || 'Active learner demonstrating strong workplace etiquette.'}"
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="candidate-card-actions">
                      <button
                        className="btn btn-sm btn-outline flex-1"
                        onClick={() => handleOpenCandidateModal(cand)}
                      >
                        <Eye size={14} />
                        <span>View Full Profile</span>
                      </button>

                      {stage === 'available' ? (
                        <button
                          className="btn btn-sm btn-primary flex-1"
                          onClick={() => handleShortlist(cand._id, cand.name)}
                        >
                          <UserPlus size={14} />
                          <span>Shortlist Candidate</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline flex-1"
                          onClick={() => setActiveTab('pipeline')}
                        >
                          <ArrowRight size={14} />
                          <span>View in Pipeline</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HIRING PIPELINE MANAGEMENT */}
      {activeTab === 'pipeline' && (
        <div className="tab-content">
          <div className="pipeline-board">
            {pipelineStages.map((stage) => {
              const stageCandidates = pipeline.filter((p) => p.stage === stage.id);

              return (
                <div key={stage.id} className="pipeline-column">
                  <div className="pipeline-column-header">
                    <span className="column-title">{stage.title}</span>
                    <span className="column-count">{stageCandidates.length}</span>
                  </div>

                  <div className="pipeline-cards-list">
                    {stageCandidates.length === 0 ? (
                      <div className="empty-column-box">No candidates in this stage.</div>
                    ) : (
                      stageCandidates.map((item) => (
                        <div key={item._id} className="pipeline-item-card">
                          <div className="item-title">{item.candidateName}</div>
                          <div className="item-role">{item.roleApplied}</div>
                          <div className="item-meta">
                            <span>{item.center}</span>
                          </div>

                          {item.interviewDate && (
                            <div className="item-interview-info">
                              <Calendar size={12} />
                              <span>
                                {item.interviewDate} {item.interviewTime ? `at ${item.interviewTime}` : ''}
                              </span>
                            </div>
                          )}

                          {item.offeredSalary && (
                            <div className="item-salary-info">
                              <span>INR {item.offeredSalary.toLocaleString()} /mo</span>
                            </div>
                          )}

                          <div className="item-notes">"{item.notes}"</div>

                          {/* Stage Transition Actions */}
                          <div className="pipeline-card-actions">
                            {stage.id === 'shortlisted' && (
                              <button
                                className="btn btn-sm btn-primary w-full"
                                onClick={() =>
                                  setStageModal({
                                    candidate: item,
                                    targetStage: 'interview_scheduled',
                                    pipelineId: item._id,
                                  })
                                }
                              >
                                <Calendar size={12} />
                                <span>Schedule Interview</span>
                              </button>
                            )}

                            {stage.id === 'interview_scheduled' && (
                              <div className="btn-group-row">
                                <button
                                  className="btn btn-sm btn-primary flex-1"
                                  onClick={() =>
                                    setStageModal({
                                      candidate: item,
                                      targetStage: 'offered',
                                      pipelineId: item._id,
                                    })
                                  }
                                >
                                  <span>Extend Offer</span>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline flex-1"
                                  onClick={() =>
                                    setStageModal({
                                      candidate: item,
                                      targetStage: 'rejected',
                                      pipelineId: item._id,
                                    })
                                  }
                                >
                                  <span>Archive</span>
                                </button>
                              </div>
                            )}

                            {stage.id === 'offered' && (
                              <button
                                className="btn btn-sm btn-primary w-full"
                                onClick={() =>
                                  setStageModal({
                                    candidate: item,
                                    targetStage: 'hired',
                                    pipelineId: item._id,
                                  })
                                }
                              >
                                <CheckCircle size={12} />
                                <span>Confirm Placement (Hire)</span>
                              </button>
                            )}

                            {stage.id === 'hired' && (
                              <div className="hired-badge-display">
                                <Check size={14} />
                                <span>Hired & Placed with Employer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY PROFILE & REGISTRATION */}
      {activeTab === 'company' && (
        <div className="tab-content">
          <div className="grid-2-col">
            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Employer Profile & Registration</h2>
              </div>
              <form onSubmit={handleUpdateCompany} className="form-stack">
                <div className="form-group">
                  <label>Company / Organization Name</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Primary Hiring Manager / Contact Person</label>
                  <input
                    type="text"
                    value={company.contactPerson}
                    onChange={(e) => setCompany({ ...company, contactPerson: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Industry Sector</label>
                  <input
                    type="text"
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Official Contact Phone</label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Hiring Target (Annual Candidates)</label>
                  <input
                    type="number"
                    value={company.hiringTarget}
                    onChange={(e) => setCompany({ ...company, hiringTarget: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  <span>Save Registration Profile</span>
                </button>
              </form>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">ETASHA Partnership Guidelines</h2>
              </div>
              <div className="guidelines-list">
                <div className="guideline-item">
                  <div className="font-bold">Fair Wage Standard</div>
                  <p className="text-muted">
                    All hiring partners agree to offer starting salaries at or above industry benchmarks (minimum INR 15,000/month with statutory benefits).
                  </p>
                </div>

                <div className="guideline-item" style={{ marginTop: '16px' }}>
                  <div className="font-bold">Post-Placement Support</div>
                  <p className="text-muted">
                    ETASHA provides 6 months of continuous mentorship and workplace adjustment counseling to ensure long-term retention.
                  </p>
                </div>

                <div className="guideline-item" style={{ marginTop: '16px' }}>
                  <div className="font-bold">Equal Opportunity Hiring</div>
                  <p className="text-muted">
                    Priority consideration for young women and first-generation job seekers from resource-poor communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CANDIDATE DEEP PROFILE */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedCandidate.name}</h2>
                <p className="text-muted">
                  {selectedCandidate.center} • {selectedCandidate.batch} • Attendance:{' '}
                  {selectedCandidate.softSkillsProfile?.attendanceRate || 85}%
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedCandidate(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Skill Badges */}
              <div className="modal-section">
                <h3 className="section-title">Verified Skill Badges</h3>
                <div className="modal-badges-grid">
                  {(selectedCandidate.softSkillsProfile?.badgesEarned || ['Active Communicator', 'Punctuality Star']).map(
                    (b, i) => (
                      <div key={i} className="modal-badge-card">
                        <Award size={16} />
                        <div>
                          <div className="font-bold">{b}</div>
                          <div className="text-xs text-muted">ETASHA Faculty Certified</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Competency Breakdown */}
              <div className="modal-section">
                <h3 className="section-title">Soft Skills Developmental Assessment</h3>
                <div className="competency-bars-list">
                  <div className="comp-item">
                    <div className="comp-label">
                      <span>Confidence & Mindset</span>
                      <span className="font-bold">
                        {selectedCandidate.softSkillsProfile?.confidenceScore || 65}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${selectedCandidate.softSkillsProfile?.confidenceScore || 65}%` }}
                      />
                    </div>
                  </div>

                  <div className="comp-item" style={{ marginTop: '12px' }}>
                    <div className="comp-label">
                      <span>Spoken English & Communication</span>
                      <span className="font-bold">
                        {selectedCandidate.softSkillsProfile?.communicationScore || 70}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${selectedCandidate.softSkillsProfile?.communicationScore || 70}%` }}
                      />
                    </div>
                  </div>

                  <div className="comp-item" style={{ marginTop: '12px' }}>
                    <div className="comp-label">
                      <span>Workplace Etiquette & Grooming</span>
                      <span className="font-bold">
                        {selectedCandidate.softSkillsProfile?.workplaceEtiquetteScore || 75}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${selectedCandidate.softSkillsProfile?.workplaceEtiquetteScore || 75}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="comp-item" style={{ marginTop: '12px' }}>
                    <div className="comp-label">
                      <span>Job Interview Readiness</span>
                      <span className="font-bold">
                        {selectedCandidate.softSkillsProfile?.interviewReadinessScore || 60}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${selectedCandidate.softSkillsProfile?.interviewReadinessScore || 60}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainer Endorsement */}
              <div className="modal-section">
                <h3 className="section-title">Trainer Endorsement & Recommendations</h3>
                <div className="endorsement-box">
                  <p className="endorsement-quote">
                    "{selectedCandidate.softSkillsProfile?.trainerNotes ||
                      'Demonstrates exceptional polite communication, active listening, and strong commitment.'}"
                  </p>
                  <div className="endorsement-author">
                    — Sunita Sharma, Lead Soft Skills Trainer (Sangam Vihar CDC)
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedCandidate(null)}>
                <span>Close</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleShortlist(selectedCandidate._id, selectedCandidate.name)}
              >
                <UserPlus size={16} />
                <span>Shortlist for Hiring Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STAGE TRANSITION (INTERVIEW / OFFER / HIRE) */}
      {stageModal && (
        <div className="modal-overlay" onClick={() => setStageModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {stageModal.targetStage === 'interview_scheduled'
                  ? 'Schedule Candidate Interview'
                  : stageModal.targetStage === 'offered'
                  ? 'Extend Employment Offer'
                  : stageModal.targetStage === 'hired'
                  ? 'Confirm Placement (Hire Candidate)'
                  : 'Update Pipeline Stage'}
              </h2>
              <button className="modal-close-btn" onClick={() => setStageModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStageSubmit}>
              <div className="modal-body">
                <div className="candidate-summary-banner">
                  <div className="font-bold">{stageModal.candidate.candidateName}</div>
                  <div className="text-muted text-xs">{stageModal.candidate.center}</div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Target Job Role</label>
                  <input
                    type="text"
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {stageModal.targetStage === 'interview_scheduled' && (
                  <div className="grid-2-col" style={{ marginTop: '14px' }}>
                    <div className="form-group">
                      <label>Interview Date</label>
                      <input
                        type="date"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Interview Time</label>
                      <input
                        type="text"
                        value={modalTime}
                        onChange={(e) => setModalTime(e.target.value)}
                        className="form-input"
                        placeholder="e.g. 11:00 AM"
                        required
                      />
                    </div>
                  </div>
                )}

                {(stageModal.targetStage === 'offered' || stageModal.targetStage === 'hired') && (
                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <label>Monthly Salary (INR)</label>
                    <input
                      type="number"
                      value={modalSalary}
                      onChange={(e) => setModalSalary(Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Recruiter Remarks / Notes</label>
                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="form-input"
                    placeholder="Add specific feedback or interview instructions..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStageModal(null)}
                >
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Confirm Stage Transition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployerDashboard;
