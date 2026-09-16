import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
 Plus,
 Trash2,
 Edit,
 Sparkles,
 DollarSign,
 ShieldCheck,
 LogOut,
} from 'lucide-react';

export const EmployerDashboard = () => {
  const { t } = useTranslation();
 const { user, logout } = useAuth();

 // Active Tab Navigation
 const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jobs' | 'graduates' | 'pipeline' | 'company'

 // Overview & Company Data
 const [company, setCompany] = useState({
 name: '',
 contactPerson: '',
 email: '',
 phone: '',
 industry: '',
 hiringTarget: 1,
 locations: [],
 });

 const [metrics, setMetrics] = useState({
 totalGraduates: 10,
 activeJobsCount: 4,
 shortlistedCount: 0,
 interviewCount: 0,
 offeredCount: 0,
 hiredCount: 0,
 conversionRate: 0,
 });

 // Jobs State
 const [jobs, setJobs] = useState([]);
 const [selectedJobForMatch, setSelectedJobForMatch] = useState('');
 const [isJobModalOpen, setIsJobModalOpen] = useState(false);
 const [editingJobId, setEditingJobId] = useState(null);

 const [jobForm, setJobForm] = useState({
 title: '',
 roleCategory: '',
 openings: 1,
 minSalary: 0,
 maxSalary: 0,
 location: '',
 jobType: 'Full-Time',
 description: '',
 requirements: '',
 requiredBadges: [],
 minConfidenceScore: 0,
 minAttendanceRate: 0,
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
 const [modalDate, setModalDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
 const [modalTime, setModalTime] = useState('11:00 AM');
 const [modalNotes, setModalNotes] = useState('');

 // Notifications
 const [notification, setNotification] = useState('');
 const showNotification = (msg) => {
 setNotification(msg);
 setTimeout(() => setNotification(''), 4000);
 };

 // 1. Fetch Employer Profile & Metrics
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

 // 2. Fetch Jobs
 const fetchJobs = async () => {
 try {
 const res = await fetch('/api/employer/jobs');
 if (res.ok) {
 const data = await res.json();
 if (data.jobs) {
 setJobs(data.jobs);
 }
 }
 } catch (err) {
 console.warn('Error fetching jobs:', err);
 }
 };

 // 3. Fetch Graduates with Filters & Smart Job Matching
 const fetchGraduates = async (jobId = selectedJobForMatch) => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 if (searchTerm) params.append('search', searchTerm);
 if (centerFilter !== 'all') params.append('center', centerFilter);
 if (badgeFilter !== 'all') params.append('badge', badgeFilter);
 if (minScoreFilter) params.append('minScore', minScoreFilter);
 if (statusFilter !== 'all') params.append('status', statusFilter);
 if (jobId) params.append('jobId', jobId);

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

 // 4. Fetch Pipeline
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
 fetchJobs();
 fetchGraduates();
 fetchPipeline();
 }, []);

 // Trigger search on filter changes
 useEffect(() => {
 fetchGraduates(selectedJobForMatch);
 }, [searchTerm, centerFilter, badgeFilter, minScoreFilter, statusFilter, selectedJobForMatch]);

 // 5. Open Post / Edit Job Modal
 const handleOpenJobModal = (jobToEdit = null) => {
 if (jobToEdit) {
 setEditingJobId(jobToEdit._id || jobToEdit.id);
 setJobForm({
 title: jobToEdit.title,
 roleCategory: jobToEdit.roleCategory || 'Retail',
 openings: jobToEdit.openings || 5,
 minSalary: jobToEdit.minSalary || 16000,
 maxSalary: jobToEdit.maxSalary || 22000,
 location: jobToEdit.location || 'South Delhi',
 jobType: jobToEdit.jobType || 'Full-Time',
 description: jobToEdit.description || '',
 requirements: Array.isArray(jobToEdit.requirements)
 ? jobToEdit.requirements.join('\n')
 : jobToEdit.requirements || '',
 requiredBadges: jobToEdit.requiredBadges || ['Active Communicator'],
 minConfidenceScore: jobToEdit.minConfidenceScore || 70,
 minAttendanceRate: jobToEdit.minAttendanceRate || 80,
 });
 } else {
 setEditingJobId(null);
 setJobForm({
 title: '',
 roleCategory: '',
 openings: 1,
 minSalary: 0,
 maxSalary: 0,
 location: '',
 jobType: 'Full-Time',
 description: '',
 requirements: '',
 requiredBadges: [],
 minConfidenceScore: 0,
 minAttendanceRate: 0,
 });
 }
 setIsJobModalOpen(true);
 };

 // Save Job Post (Create / Update)
 const handleSaveJob = async (e) => {
 e.preventDefault();
 try {
 const payload = {
 ...jobForm,
 openings: Number(jobForm.openings),
 minSalary: Number(jobForm.minSalary),
 maxSalary: Number(jobForm.maxSalary),
 minConfidenceScore: Number(jobForm.minConfidenceScore),
 minAttendanceRate: Number(jobForm.minAttendanceRate),
 employerName: company.name,
 requirements: jobForm.requirements.split('\n').filter((r) => r.trim().length > 0),
 };

 const url = editingJobId ? `/api/employer/jobs/${editingJobId}` : '/api/employer/jobs';
 const method = editingJobId ? 'PUT' : 'POST';

 const res = await fetch(url, {
 method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });

 const data = await res.json();
 if (res.ok) {
 showNotification(data.message || 'Job vacancy saved successfully.');
 setIsJobModalOpen(false);
 fetchJobs();
 fetchProfileAndMetrics();
 } else {
 showNotification(data.message || 'Error saving job vacancy.');
 }
 } catch (err) {
 showNotification('Failed to connect to server.');
 }
 };

 // Delete Job
 const handleDeleteJob = async (jobId) => {
 if (!window.confirm('Are you sure you want to close this job vacancy?')) return;
 try {
 const res = await fetch(`/api/employer/jobs/${jobId}`, { method: 'DELETE' });
 if (res.ok) {
 showNotification('Job vacancy closed.');
 fetchJobs();
 fetchProfileAndMetrics();
 }
 } catch (err) {
 showNotification('Failed to remove job.');
 }
 };

 // Switch to Matching candidates for a specific job
 const handleMatchForJob = (job) => {
 const jId = job._id || job.id;
 setSelectedJobForMatch(jId);
 setActiveTab('graduates');
 showNotification(`Filtering talent pool for "${job.title}" matching criteria.`);
 };

 // 6. View Candidate Deep Profile
 const handleOpenCandidateModal = async (candidate) => {
 setSelectedCandidate(candidate);
 setLoadingDetails(true);
 try {
 const id = candidate._id || candidate.id;
 const res = await fetch(`/api/employer/candidates/${id}`);
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

 // 7. Shortlist Candidate into Pipeline
 const handleShortlist = async (candidateId, candidateName, roleTitle = 'Customer Sales Associate') => {
 try {
 const res = await fetch('/api/employer/pipeline', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 candidateId,
 roleApplied: roleTitle,
 employerName: company.name,
 offeredSalary: 16500,
 }),
 });
 const data = await res.json();
 if (res.ok) {
 showNotification(`Candidate "${candidateName}" shortlisted for ${roleTitle}.`);
 fetchProfileAndMetrics();
 fetchGraduates();
 fetchPipeline();
 } else {
 showNotification(data.message || 'Failed to shortlist candidate.');
 }
 } catch (err) {
 showNotification('Error shortlisting candidate.');
 }
 };

 // 8. Open Stage Action Modal (Interview / Offer / Hire)
 const handleOpenStageModal = (candidate, targetStage) => {
 setStageModal({
 candidate,
 targetStage,
 pipelineId: candidate._id || candidate.id,
 });
 setModalRole(candidate.roleApplied || 'Customer Sales Associate');
 setModalSalary(candidate.offeredSalary || 16500);
 setModalNotes(candidate.notes || '');
 };

 // Submit Stage Action
 const handleStageSubmit = async (e) => {
 e.preventDefault();
 if (!stageModal) return;

 try {
 const { pipelineId, targetStage } = stageModal;
 const body = {
 stage: targetStage,
 roleApplied: modalRole,
 notes: modalNotes,
 employerName: company.name,
 };

 if (targetStage === 'interview_scheduled') {
 body.interviewDate = modalDate;
 body.interviewTime = modalTime;
 } else if (targetStage === 'offered' || targetStage === 'hired') {
 body.offeredSalary = Number(modalSalary);
 }

 const res = await fetch(`/api/employer/pipeline/${pipelineId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body),
 });

 const data = await res.json();
 if (res.ok) {
 if (targetStage === 'hired') {
 showNotification(` Candidate hired at INR ${modalSalary.toLocaleString()}/mo. Official placement synchronized in MongoDB Atlas.`);
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

 // 9. Update Company Profile
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
 hiringTarget: company.hiringTarget,
 }),
 });
 const data = await res.json();
 if (res.ok) {
 showNotification('Company profile and recruitment preferences saved in database.');
 fetchProfileAndMetrics();
 } else {
 showNotification(data.message || 'Failed to update profile.');
 }
 } catch (err) {
 showNotification('Error updating company profile.');
 }
 };

 // Badges Available for selection in job form
 const AVAILABLE_BADGES = [
 'Active Communicator',
 'Confidence Champion',
 'Punctuality Star',
 'Customer Service Star',
 'Workplace Ethics',
 'Team Leader',
 'Interview Star',
 ];

 const handleBadgeToggle = (badge) => {
 if (jobForm.requiredBadges.includes(badge)) {
 setJobForm({
 ...jobForm,
 requiredBadges: jobForm.requiredBadges.filter((b) => b !== badge),
 });
 } else {
 setJobForm({
 ...jobForm,
 requiredBadges: [...jobForm.requiredBadges, badge],
 });
 }
 };

 const selectedJobObj = jobs.find((j) => (j._id || j.id) === selectedJobForMatch);

 return (
 <div className="portal-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
 {/* Toast Notification */}
 {notification && (
 <div style={{
 position: 'fixed',
 top: '20px',
 right: '20px',
 zIndex: 9999,
 backgroundColor: '#111827',
 color: '#FFFFFF',
 padding: '0.85rem 1.25rem',
 borderRadius: '6px',
 boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
 display: 'flex',
 alignItems: 'center',
 gap: '0.6rem',
 fontSize: '0.88rem',
 }}>
 <Check size={16} color="#10B981" />
 <span>{notification}</span>
 <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', marginLeft: '0.5rem' }} onClick={() => setNotification('')}>
 <X size={14} />
 </button>
 </div>
 )}

 {/* Top Header */}
 <header style={{
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 flexWrap: 'wrap',
 gap: '1rem',
 paddingBottom: '1.25rem',
 borderBottom: '1px solid #E5E7EB',
 marginBottom: '1.5rem',
 }}>
 <div>
 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F3F4F6', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
 <Briefcase size={13} />
 <span>{t('dashboards.employer_portal')}</span>
 </div>
 <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{company.name}</h1>
 <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
 Hiring Partner • Recruiter: <strong>{company.contactPerson}</strong> • {company.industry}
 </p>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
 <button
 className="btn-primary"
 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
 onClick={() => handleOpenJobModal()}
 >
 <Plus size={16} />
 <span>Post New Job Vacancy</span>
 </button>
 <button
 style={{
 padding: '0.5rem 0.85rem',
 borderRadius: '4px',
 border: '1px solid #D1D5DB',
 background: '#FFFFFF',
 color: '#374151',
 cursor: 'pointer',
 display: 'inline-flex',
 alignItems: 'center',
 gap: '0.4rem',
 fontSize: '0.85rem',
 fontWeight: 500,
 }}
 onClick={logout}
 >
 <LogOut size={15} />
 <span>{t('dashboards.logout')}</span>
 </button>
 </div>
 </header>

 {/* Navigation Tabs */}
 <nav style={{
 display: 'flex',
 gap: '0.5rem',
 borderBottom: '1px solid #E5E7EB',
 marginBottom: '1.5rem',
 overflowX: 'auto',
 }}>
 {[
 { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
 { id: 'jobs', label: `Active Jobs & Roles (${jobs.length})`, icon: <Briefcase size={16} /> },
 { id: 'graduates', label: `Graduate Talent Pool (${graduates.length})`, icon: <Users size={16} /> },
 { id: 'pipeline', label: `Hiring Pipeline (${pipeline.length})`, icon: <CheckCircle size={16} /> },
 { id: 'company', label: 'Company Profile', icon: <Building size={16} /> },
 ].map((t) => (
 <button
 key={t.id}
 style={{
 padding: '0.65rem 1rem',
 border: 'none',
 background: 'transparent',
 borderBottom: activeTab === t.id ? '2px solid #111827' : '2px solid transparent',
 color: activeTab === t.id ? '#111827' : '#6B7280',
 fontWeight: activeTab === t.id ? 700 : 500,
 fontSize: '0.88rem',
 cursor: 'pointer',
 display: 'inline-flex',
 alignItems: 'center',
 gap: '0.4rem',
 whiteSpace: 'nowrap',
 }}
 onClick={() => setActiveTab(t.id)}
 >
 {t.icon}
 <span>{t.label}</span>
 </button>
 ))}
 </nav>

 {/* TAB 1: OVERVIEW & FUNNEL METRICS */}
 {activeTab === 'overview' && (
 <div>
 {/* Top Metrics Cards */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
 <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.82rem', fontWeight: 600 }}>
 <span>Active Job Postings</span>
 <Briefcase size={18} />
 </div>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0.4rem 0' }}>{jobs.length}</div>
 <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 500 }}>Live Vacancies in MongoDB</div>
 </div>

 <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.82rem', fontWeight: 600 }}>
 <span>Available Graduates</span>
 <Users size={18} />
 </div>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0.4rem 0' }}>{metrics.totalGraduates}</div>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ETASHA Verified Candidates</div>
 </div>

 <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.82rem', fontWeight: 600 }}>
 <span>Shortlisted</span>
 <Eye size={18} />
 </div>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0.4rem 0' }}>{metrics.shortlistedCount}</div>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>In Active Review</div>
 </div>

 <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.82rem', fontWeight: 600 }}>
 <span>Interviews Scheduled</span>
 <Calendar size={18} />
 </div>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0.4rem 0' }}>{metrics.interviewCount}</div>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Evaluation Rounds</div>
 </div>

 <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '6px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.82rem', fontWeight: 600 }}>
 <span>Confirmed Hires</span>
 <CheckCircle size={18} color="#10B981" />
 </div>
 <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', margin: '0.4rem 0' }}>{metrics.hiredCount}</div>
 <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 500 }}>Placed & Synchronized</div>
 </div>
 </div>

 {/* Quick Action Banner */}
 <div style={{
 background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
 color: '#FFFFFF',
 padding: '1.5rem',
 borderRadius: '6px',
 marginBottom: '1.5rem',
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 flexWrap: 'wrap',
 gap: '1rem',
 }}>
 <div>
 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#FCD34D', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
 <Sparkles size={15} />
 <span>AI-ASSISTED SKILL-BASED MATCHING</span>
 </div>
 <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Find Trained & Certified Youth for Open Vacancies</h2>
 <p style={{ fontSize: '0.85rem', color: '#D1D5DB', marginTop: '0.2rem' }}>
 Match candidates by Spoken English, Grooming, Retail & BPO Readiness, and Punctuality scores.
 </p>
 </div>
 <div style={{ display: 'flex', gap: '0.75rem' }}>
 <button
 style={{ backgroundColor: '#FFFFFF', color: '#111827', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
 onClick={() => handleOpenJobModal()}
 >
 + Post New Role
 </button>
 <button
 style={{ backgroundColor: 'transparent', color: '#FFFFFF', border: '1px solid #6B7280', padding: '0.6rem 1.2rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
 onClick={() => setActiveTab('graduates')}
 >
 Browse Matched Graduates →
 </button>
 </div>
 </div>

 {/* Jobs Table in Overview */}
 <div style={{ background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E5E7EB', padding: '1.25rem', marginBottom: '1.5rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
 <div>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>Live Job Postings & Hiring Requisitions</h3>
 <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Real job postings stored in database and active for trainee applications</p>
 </div>
 <button
 style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
 onClick={() => setActiveTab('jobs')}
 >
 Manage All ({jobs.length})
 </button>
 </div>

 <div style={{ overflowX: 'auto' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
 <thead>
 <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
 <th style={{ padding: '0.65rem 0.75rem' }}>Job Title</th>
 <th style={{ padding: '0.65rem 0.75rem' }}>Category</th>
 <th style={{ padding: '0.65rem 0.75rem' }}>Openings</th>
 <th style={{ padding: '0.65rem 0.75rem' }}>Salary Range</th>
 <th style={{ padding: '0.65rem 0.75rem' }}>Target Location</th>
 <th style={{ padding: '0.65rem 0.75rem' }}>Required Badges</th>
 <th style={{ padding: '0.65rem 0.75rem' }}>Actions</th>
 </tr>
 </thead>
 <tbody>
 {jobs.map((j) => (
 <tr key={j._id || j.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
 <td style={{ padding: '0.75rem', fontWeight: 600 }}>{j.title}</td>
 <td style={{ padding: '0.75rem' }}>
 <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
 {j.roleCategory || 'Retail'}
 </span>
 </td>
 <td style={{ padding: '0.75rem', fontWeight: 600 }}>{j.openings} Positions</td>
 <td style={{ padding: '0.75rem' }}>INR {j.minSalary?.toLocaleString()} - {j.maxSalary?.toLocaleString()}/mo</td>
 <td style={{ padding: '0.75rem', color: '#6B7280' }}>{j.location}</td>
 <td style={{ padding: '0.75rem' }}>
 <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
 {(j.requiredBadges || []).map((b, i) => (
 <span key={i} style={{ backgroundColor: '#F3F4F6', fontSize: '0.72rem', padding: '0.15rem 0.4rem', borderRadius: '3px', color: '#374151' }}>
 {b}
 </span>
 ))}
 </div>
 </td>
 <td style={{ padding: '0.75rem' }}>
 <button
 style={{
 backgroundColor: '#111827',
 color: '#FFFFFF',
 border: 'none',
 padding: '0.35rem 0.75rem',
 borderRadius: '4px',
 fontSize: '0.78rem',
 cursor: 'pointer',
 fontWeight: 600,
 }}
 onClick={() => handleMatchForJob(j)}
 >
 Find Matched Youths →
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* TAB 2: ACTIVE JOBS & ROLES MANAGEMENT */}
 {activeTab === 'jobs' && (
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.25rem' }}>
 <div>
 <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Job Openings & Role Specifications</h2>
 <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>
 Define roles, salary packages, required soft skills badges, and view matching certified graduates
 </p>
 </div>
 <button
 className="btn-primary"
 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem' }}
 onClick={() => handleOpenJobModal()}
 >
 <Plus size={16} />
 <span>Post New Role</span>
 </button>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
 {jobs.map((job) => {
 const jId = job._id || job.id;
 return (
 <div
 key={jId}
 style={{
 background: '#FFFFFF',
 borderRadius: '6px',
 border: '1px solid #E5E7EB',
 padding: '1.25rem',
 boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
 display: 'flex',
 flexDirection: 'column',
 justifyContent: 'space-between',
 }}
 >
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
 <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
 {job.roleCategory || 'Retail'}
 </span>
 <span style={{ backgroundColor: '#ECFDF5', color: '#065F46', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
 {job.openings} Openings
 </span>
 </div>

 <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>{job.title}</h3>
 <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.4', marginBottom: '0.85rem' }}>{job.description}</p>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#4B5563', backgroundColor: '#F9FAFB', padding: '0.75rem', borderRadius: '4px', marginBottom: '0.85rem' }}>
 <div>
 <div style={{ color: '#6B7280', fontSize: '0.72rem' }}>Salary Range</div>
 <div style={{ fontWeight: 700, color: '#111827' }}>₹{job.minSalary?.toLocaleString()} - {job.maxSalary?.toLocaleString()}</div>
 </div>
 <div>
 <div style={{ color: '#6B7280', fontSize: '0.72rem' }}>Work Location</div>
 <div style={{ fontWeight: 600, color: '#111827' }}>{job.location}</div>
 </div>
 <div>
 <div style={{ color: '#6B7280', fontSize: '0.72rem' }}>Min Confidence</div>
 <div style={{ fontWeight: 600 }}>{job.minConfidenceScore || 70}%</div>
 </div>
 <div>
 <div style={{ color: '#6B7280', fontSize: '0.72rem' }}>Min Attendance</div>
 <div style={{ fontWeight: 600 }}>{job.minAttendanceRate || 80}%</div>
 </div>
 </div>

 <div style={{ marginBottom: '1rem' }}>
 <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.3rem' }}>Required Faculty Badges:</div>
 <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
 {(job.requiredBadges || ['Active Communicator']).map((b, i) => (
 <span key={i} style={{ backgroundColor: '#F3F4F6', color: '#1F2937', fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
 {b}
 </span>
 ))}
 </div>
 </div>
 </div>

 <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F3F4F6', paddingTop: '0.85rem' }}>
 <button
 className="btn-primary"
 style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
 onClick={() => handleMatchForJob(job)}
 >
 <Sparkles size={14} />
 <span>View Matched Youth</span>
 </button>
 <button
 style={{ padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', background: '#FFFFFF', borderRadius: '4px', cursor: 'pointer' }}
 onClick={() => handleOpenJobModal(job)}
 title="Edit Job"
 >
 <Edit size={14} />
 </button>
 <button
 style={{ padding: '0.5rem 0.75rem', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', borderRadius: '4px', cursor: 'pointer' }}
 onClick={() => handleDeleteJob(jId)}
 title="Close Job Vacancy"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* TAB 3: GRADUATE TALENT POOL & SMART CANDIDATE MATCHING */}
 {activeTab === 'graduates' && (
 <div>
 {/* Job Match Selector Banner */}
 <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
 <Sparkles size={18} color="#4F46E5" />
 <div>
 <strong style={{ fontSize: '0.9rem', color: '#111827' }}>Smart Role Matching Filter:</strong>
 <span style={{ fontSize: '0.82rem', color: '#6B7280', marginLeft: '0.5rem' }}>
 Select a job vacancy to score candidates against required skills and attendance:
 </span>
 </div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 <select
 style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}
 value={selectedJobForMatch}
 onChange={(e) => setSelectedJobForMatch(e.target.value)}
 >
 <option value="">-- All Candidates (General Retail Profile) --</option>
 {jobs.map((j) => (
 <option key={j._id || j.id} value={j._id || j.id}>
 Match for: {j.title} ({j.roleCategory})
 </option>
 ))}
 </select>
 {selectedJobForMatch && (
 <button
 style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', padding: '0.45rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
 onClick={() => setSelectedJobForMatch('')}
 >
 Clear Match
 </button>
 )}
 </div>
 </div>

 {/* Search & Filters */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', background: '#FFFFFF', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '0.4rem 0.6rem' }}>
 <Search size={15} color="#9CA3AF" />
 <input
 type="text"
 placeholder="Search name, phone, email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
 />
 </div>

 <div>
 <select
 style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.82rem' }}
 value={centerFilter}
 onChange={(e) => setCenterFilter(e.target.value)}
 >
 <option value="all">All CDC Centers</option>
 <option value="Sangam Vihar CDC">Sangam Vihar CDC</option>
 <option value="Khanpur CDC">Khanpur CDC</option>
 <option value="Dakshinpuri CDC">Dakshinpuri CDC</option>
 <option value="Mangolpuri CDC">Mangolpuri CDC</option>
 </select>
 </div>

 <div>
 <select
 style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.82rem' }}
 value={badgeFilter}
 onChange={(e) => setBadgeFilter(e.target.value)}
 >
 <option value="all">All Badges</option>
 {AVAILABLE_BADGES.map((b) => (
 <option key={b} value={b}>{b}</option>
 ))}
 </select>
 </div>

 <div>
 <select
 style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.82rem' }}
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 >
 <option value="all">All Pipeline Stages</option>
 <option value="available">Available</option>
 <option value="shortlisted">Shortlisted</option>
 <option value="interview_scheduled">Interview Scheduled</option>
 <option value="offered">Offer Extended</option>
 <option value="hired">Hired / Placed</option>
 </select>
 </div>
 </div>

 {/* Candidates Grid */}
 {loading ? (
 <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading matching candidates from MongoDB Atlas...</div>
 ) : graduates.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
 <h3>No candidates match the specified filter criteria.</h3>
 <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Try clearing filters or adjusting required scores.</p>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
 {graduates.map((cand) => {
 const cId = cand._id || cand.id;
 const matchPct = cand.matchPercentage || 85;
 const matchColor = matchPct >= 80 ? '#10B981' : matchPct >= 65 ? '#F59E0B' : '#6B7280';

 return (
 <div
 key={cId}
 style={{
 background: '#FFFFFF',
 borderRadius: '6px',
 border: '1px solid #E5E7EB',
 padding: '1.25rem',
 boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
 display: 'flex',
 flexDirection: 'column',
 justifyContent: 'space-between',
 }}
 >
 <div>
 {/* Top Row: Name and Match Badge */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
 <div>
 <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{cand.name}</h4>
 <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{cand.center || 'Sangam Vihar CDC'} • {cand.batch || 'Batch 2026-A'}</div>
 </div>
 <div style={{
 backgroundColor: `${matchColor}15`,
 color: matchColor,
 border: `1px solid ${matchColor}40`,
 padding: '0.2rem 0.55rem',
 borderRadius: '9999px',
 fontSize: '0.78rem',
 fontWeight: 700,
 display: 'inline-flex',
 alignItems: 'center',
 gap: '0.3rem',
 }}>
 <Sparkles size={12} />
 <span>{matchPct}% Match</span>
 </div>
 </div>

 {/* Contact Info */}
 <div style={{ fontSize: '0.78rem', color: '#4B5563', marginBottom: '0.75rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
 <span> {cand.phone || '9876543210'}</span>
 <span>️ {cand.email || 'learner@etasha.org'}</span>
 </div>

 {/* Soft Skills Metrics Grid */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', backgroundColor: '#F9FAFB', padding: '0.6rem', borderRadius: '4px', marginBottom: '0.75rem', textAlign: 'center' }}>
 <div>
 <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Confidence</div>
 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{cand.softSkillsProfile?.confidenceScore || 65}%</div>
 </div>
 <div>
 <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Spoken Comm</div>
 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{cand.softSkillsProfile?.communicationScore || 70}%</div>
 </div>
 <div>
 <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Attendance</div>
 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10B981' }}>{cand.softSkillsProfile?.attendanceRate || 85}%</div>
 </div>
 </div>

 {/* Match Reasons */}
 {cand.matchReasons && cand.matchReasons.length > 0 && (
 <div style={{ marginBottom: '0.75rem' }}>
 <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.2rem' }}>Role Alignment:</div>
 <div style={{ fontSize: '0.75rem', color: '#047857' }}>
 {cand.matchReasons.slice(0, 2).map((r, i) => (
 <div key={i}> {r}</div>
 ))}
 </div>
 </div>
 )}

 {/* Badges Earned */}
 <div style={{ marginBottom: '0.85rem' }}>
 <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
 {(cand.softSkillsProfile?.badgesEarned || ['Active Communicator']).map((b, i) => (
 <span key={i} style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
 {b}
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F3F4F6', paddingTop: '0.85rem' }}>
 <button
 style={{
 flex: 1,
 padding: '0.45rem',
 background: '#F3F4F6',
 border: '1px solid #D1D5DB',
 color: '#374151',
 borderRadius: '4px',
 fontSize: '0.8rem',
 fontWeight: 600,
 cursor: 'pointer',
 }}
 onClick={() => handleOpenCandidateModal(cand)}
 >
 Deep Profile & History
 </button>

 {cand.pipelineStage && cand.pipelineStage !== 'available' ? (
 <span style={{
 padding: '0.45rem 0.75rem',
 borderRadius: '4px',
 backgroundColor: cand.pipelineStage === 'hired' ? '#ECFDF5' : '#EEF2FF',
 color: cand.pipelineStage === 'hired' ? '#065F46' : '#4F46E5',
 fontSize: '0.78rem',
 fontWeight: 700,
 display: 'inline-flex',
 alignItems: 'center',
 }}>
 {cand.pipelineStage.replace('_', ' ').toUpperCase()}
 </span>
 ) : (
 <button
 className="btn-primary"
 style={{
 padding: '0.45rem 0.85rem',
 fontSize: '0.8rem',
 display: 'inline-flex',
 alignItems: 'center',
 gap: '0.3rem',
 }}
 onClick={() => handleShortlist(cId, cand.name, selectedJobObj?.title || 'Customer Sales Associate')}
 >
 <UserPlus size={14} />
 <span>Shortlist</span>
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

 {/* TAB 4: HIRING PIPELINE & STAGE MANAGEMENT */}
 {activeTab === 'pipeline' && (
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
 <div>
 <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Recruitment & Hiring Pipeline</h2>
 <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>
 Track candidates from Shortlisting to Interview, Formal Offer, and Confirmed Hire
 </p>
 </div>
 </div>

 {pipeline.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
 <Users size={32} color="#9CA3AF" style={{ marginBottom: '0.5rem' }} />
 <h3>No candidates currently in the hiring pipeline.</h3>
 <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
 Browse the Graduate Talent Pool and click "Shortlist" to add candidates.
 </p>
 <button className="btn-primary" onClick={() => setActiveTab('graduates')}>
 Browse Talent Pool →
 </button>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
 {[
 { stage: 'shortlisted', title: '1. Shortlisted', color: '#3B82F6' },
 { stage: 'interview_scheduled', title: '2. Interview Scheduled', color: '#8B5CF6' },
 { stage: 'offered', title: '3. Offer Extended', color: '#F59E0B' },
 { stage: 'hired', title: '4. Hired & Placed', color: '#10B981' },
 ].map((col) => {
 const candidatesInCol = pipeline.filter((p) => p.stage === col.stage);
 return (
 <div
 key={col.stage}
 style={{
 background: '#F9FAFB',
 border: '1px solid #E5E7EB',
 borderRadius: '6px',
 padding: '1rem',
 minHeight: '400px',
 }}
 >
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: `2px solid ${col.color}`, paddingBottom: '0.5rem' }}>
 <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{col.title}</strong>
 <span style={{ backgroundColor: '#E5E7EB', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
 {candidatesInCol.length}
 </span>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
 {candidatesInCol.map((cand) => (
 <div
 key={cand._id || cand.id}
 style={{
 background: '#FFFFFF',
 border: '1px solid #E5E7EB',
 borderRadius: '4px',
 padding: '0.85rem',
 boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
 }}
 >
 <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{cand.candidateName}</div>
 <div style={{ fontSize: '0.78rem', color: '#4F46E5', fontWeight: 600, marginTop: '0.2rem' }}>{cand.roleApplied}</div>
 <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>{cand.center}</div>

 {col.stage === 'interview_scheduled' && cand.interviewDate && (
 <div style={{ fontSize: '0.75rem', backgroundColor: '#F5F3FF', color: '#6D28D9', padding: '0.3rem', borderRadius: '3px', marginTop: '0.4rem' }}>
 {cand.interviewDate} at {cand.interviewTime || '11:00 AM'}
 </div>
 )}

 {(col.stage === 'offered' || col.stage === 'hired') && (
 <div style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.3rem', borderRadius: '3px', marginTop: '0.4rem', fontWeight: 600 }}>
 INR {cand.offeredSalary?.toLocaleString() || '16,500'} / mo
 </div>
 )}

 {/* Stage Transition Actions */}
 <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', borderTop: '1px solid #F3F4F6', paddingTop: '0.5rem' }}>
 {col.stage === 'shortlisted' && (
 <button
 style={{ flex: 1, padding: '0.35rem', backgroundColor: '#8B5CF6', color: '#FFFFFF', border: 'none', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
 onClick={() => handleOpenStageModal(cand, 'interview_scheduled')}
 >
 Schedule Interview →
 </button>
 )}

 {col.stage === 'interview_scheduled' && (
 <button
 style={{ flex: 1, padding: '0.35rem', backgroundColor: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
 onClick={() => handleOpenStageModal(cand, 'offered')}
 >
 Make Offer →
 </button>
 )}

 {col.stage === 'offered' && (
 <button
 style={{ flex: 1, padding: '0.35rem', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
 onClick={() => handleOpenStageModal(cand, 'hired')}
 >
 Confirm Hire (Place) 
 </button>
 )}

 {col.stage === 'hired' && (
 <div style={{ width: '100%', textAlign: 'center', fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
 Placed & Synchronized Live
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {/* TAB 5: COMPANY PROFILE & PREFERENCES */}
 {activeTab === 'company' && (
 <div style={{ maxWidth: '600px', background: '#FFFFFF', padding: '1.5rem', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
 <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>Company Profile & Hiring Preferences</h2>
 <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '1.25rem' }}>
 Update your enterprise partner details, contact recruiter, and target hiring volume.
 </p>

 <form onSubmit={handleUpdateCompany}>
 <div className="form-group">
 <label className="form-label">Enterprise / Company Name</label>
 <input
 type="text"
 className="form-input"
 value={company.name}
 onChange={(e) => setCompany({ ...company, name: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Lead Recruiter / Contact Person</label>
 <input
 type="text"
 className="form-input"
 value={company.contactPerson}
 onChange={(e) => setCompany({ ...company, contactPerson: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Industry & Sector</label>
 <input
 type="text"
 className="form-input"
 value={company.industry}
 onChange={(e) => setCompany({ ...company, industry: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Contact Phone</label>
 <input
 type="text"
 className="form-input"
 value={company.phone}
 onChange={(e) => setCompany({ ...company, phone: e.target.value })}
 />
 </div>

 <div className="form-group">
 <label className="form-label">Annual Hiring Target (Youths)</label>
 <input
 type="number"
 className="form-input"
 value={company.hiringTarget || 30}
 onChange={(e) => setCompany({ ...company, hiringTarget: Number(e.target.value) })}
 />
 </div>

 <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
 Save Profile & Hiring Preferences
 </button>
 </form>
 </div>
 )}

 {/* MODAL 1: POST / EDIT JOB VACANCY */}
 {isJobModalOpen && (
 <div style={{
 position: 'fixed',
 inset: 0,
 backgroundColor: 'rgba(0,0,0,0.5)',
 zIndex: 9999,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '1rem',
 }}>
 <div style={{
 background: '#FFFFFF',
 borderRadius: '8px',
 maxWidth: '650px',
 width: '100%',
 maxHeight: '90vh',
 overflowY: 'auto',
 padding: '1.5rem',
 boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
 <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
 {editingJobId ? 'Edit Job Vacancy' : 'Post New Job Vacancy & Role Criteria'}
 </h3>
 <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsJobModalOpen(false)}>
 <X size={18} />
 </button>
 </div>

 <form onSubmit={handleSaveJob}>
 <div className="form-group">
 <label className="form-label">Job Title *</label>
 <input
 type="text"
 className="form-input"
 placeholder="e.g. Customer Sales Associate, Frontline Cashier, Tele-Advisor"
 value={jobForm.title}
 onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
 required
 />
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
 <div className="form-group">
 <label className="form-label">Role Category</label>
 <select
 className="form-select"
 value={jobForm.roleCategory}
 onChange={(e) => setJobForm({ ...jobForm, roleCategory: e.target.value })}
 >
 <option value="Retail">Retail</option>
 <option value="Customer Care / BPO">Customer Care / BPO</option>
 <option value="Banking & Finance">Banking & Finance</option>
 <option value="Hospitality">Hospitality</option>
 <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
 <option value="Healthcare">Healthcare</option>
 <option value="IT & Digital">IT & Digital</option>
 </select>
 </div>

 <div className="form-group">
 <label className="form-label">Open Vacancies *</label>
 <input
 type="number"
 className="form-input"
 value={jobForm.openings}
 onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
 required
 min={1}
 />
 </div>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
 <div className="form-group">
 <label className="form-label">Min Salary (INR / mo) *</label>
 <input
 type="number"
 className="form-input"
 value={jobForm.minSalary}
 onChange={(e) => setJobForm({ ...jobForm, minSalary: e.target.value })}
 required
 />
 </div>

 <div className="form-group">
 <label className="form-label">Max Salary (INR / mo)</label>
 <input
 type="number"
 className="form-input"
 value={jobForm.maxSalary}
 onChange={(e) => setJobForm({ ...jobForm, maxSalary: e.target.value })}
 />
 </div>
 </div>

 <div className="form-group">
 <label className="form-label">Location / Target Cluster</label>
 <input
 type="text"
 className="form-input"
 placeholder="e.g. South Delhi (Sangam Vihar & Saket) or Noida"
 value={jobForm.location}
 onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
 />
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
 <div className="form-group">
 <label className="form-label">Min Confidence Score (%)</label>
 <input
 type="number"
 className="form-input"
 value={jobForm.minConfidenceScore}
 onChange={(e) => setJobForm({ ...jobForm, minConfidenceScore: e.target.value })}
 min={40}
 max={100}
 />
 </div>

 <div className="form-group">
 <label className="form-label">Min Attendance Rate (%)</label>
 <input
 type="number"
 className="form-input"
 value={jobForm.minAttendanceRate}
 onChange={(e) => setJobForm({ ...jobForm, minAttendanceRate: e.target.value })}
 min={50}
 max={100}
 />
 </div>
 </div>

 {/* Required Badges Selector */}
 <div className="form-group">
 <label className="form-label">Required Faculty-Certified Badges</label>
 <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
 {AVAILABLE_BADGES.map((badge) => {
 const isSelected = jobForm.requiredBadges.includes(badge);
 return (
 <button
 type="button"
 key={badge}
 style={{
 padding: '0.3rem 0.6rem',
 borderRadius: '4px',
 fontSize: '0.75rem',
 fontWeight: 600,
 border: isSelected ? '1px solid #111827' : '1px solid #D1D5DB',
 backgroundColor: isSelected ? '#111827' : '#FFFFFF',
 color: isSelected ? '#FFFFFF' : '#374151',
 cursor: 'pointer',
 }}
 onClick={() => handleBadgeToggle(badge)}
 >
 {isSelected ? ' ' : '+ '} {badge}
 </button>
 );
 })}
 </div>
 </div>

 <div className="form-group">
 <label className="form-label">Job Description</label>
 <textarea
 className="form-input"
 rows={3}
 value={jobForm.description}
 onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
 placeholder="Describe role responsibilities..."
 />
 </div>

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
 <button
 type="button"
 style={{ padding: '0.55rem 1rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
 onClick={() => setIsJobModalOpen(false)}
 >
 Cancel
 </button>
 <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
 {editingJobId ? 'Save Changes' : 'Publish Job Vacancy'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* MODAL 2: CANDIDATE DEEP PROFILE & ASSESSMENT HISTORY */}
 {selectedCandidate && (
 <div style={{
 position: 'fixed',
 inset: 0,
 backgroundColor: 'rgba(0,0,0,0.5)',
 zIndex: 9999,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '1rem',
 }}>
 <div style={{
 background: '#FFFFFF',
 borderRadius: '8px',
 maxWidth: '650px',
 width: '100%',
 maxHeight: '90vh',
 overflowY: 'auto',
 padding: '1.5rem',
 boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
 <div>
 <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>{selectedCandidate.name}</h3>
 <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
 {selectedCandidate.center || 'Sangam Vihar CDC'} • {selectedCandidate.batch || 'Batch 2026-A'}
 </div>
 </div>
 <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedCandidate(null)}>
 <X size={18} />
 </button>
 </div>

 {loadingDetails ? (
 <div style={{ textAlign: 'center', padding: '2rem' }}>Loading candidate verification data from MongoDB...</div>
 ) : (
 <div>
 {/* Soft Skills Profile Breakdown */}
 <div style={{ marginBottom: '1.25rem' }}>
 <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>Certified Soft Skills Competencies</h4>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
 <div style={{ background: '#F9FAFB', padding: '0.6rem', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Confidence & Demeanor</div>
 <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCandidate.softSkillsProfile?.confidenceScore || 65}%</div>
 </div>
 <div style={{ background: '#F9FAFB', padding: '0.6rem', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Spoken Communication</div>
 <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCandidate.softSkillsProfile?.communicationScore || 70}%</div>
 </div>
 <div style={{ background: '#F9FAFB', padding: '0.6rem', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Workplace Ethics & Grooming</div>
 <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCandidate.softSkillsProfile?.workplaceEtiquetteScore || 75}%</div>
 </div>
 <div style={{ background: '#F9FAFB', padding: '0.6rem', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Cohort Attendance Rate</div>
 <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10B981' }}>{selectedCandidate.softSkillsProfile?.attendanceRate || 85}%</div>
 </div>
 </div>
 </div>

 {/* Badges Earned */}
 <div style={{ marginBottom: '1.25rem' }}>
 <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem' }}>Faculty-Endorsed Badges</h4>
 <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
 {(selectedCandidate.softSkillsProfile?.badgesEarned || ['Active Communicator', 'Confidence Champion']).map((b, i) => (
 <span key={i} style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
 {b}
 </span>
 ))}
 </div>
 </div>

 {/* Trainer Remarks */}
 <div style={{ backgroundColor: '#F3F4F6', padding: '0.85rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
 <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.2rem' }}>Faculty Endorsement & Assessment Notes:</div>
 <p style={{ fontSize: '0.82rem', color: '#4B5563', fontStyle: 'italic' }}>
 "{selectedCandidate.softSkillsProfile?.trainerNotes || 'Candidate shows proactive initiative, polite greeting etiquette, high punctuality, and excellent readiness for customer interaction.'}"
 </p>
 </div>

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
 <button
 style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
 onClick={() => setSelectedCandidate(null)}
 >
 Close
 </button>
 <button
 className="btn-primary"
 style={{ padding: '0.5rem 1.25rem' }}
 onClick={() => {
 handleShortlist(selectedCandidate._id || selectedCandidate.id, selectedCandidate.name, selectedJobObj?.title || 'Customer Sales Associate');
 setSelectedCandidate(null);
 }}
 >
 Shortlist for Hiring Pipeline
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {/* MODAL 3: STAGE TRANSITION (INTERVIEW / OFFER / HIRE) */}
 {stageModal && (
 <div style={{
 position: 'fixed',
 inset: 0,
 backgroundColor: 'rgba(0,0,0,0.5)',
 zIndex: 9999,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '1rem',
 }}>
 <div style={{
 background: '#FFFFFF',
 borderRadius: '8px',
 maxWidth: '500px',
 width: '100%',
 padding: '1.5rem',
 boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
 <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
 {stageModal.targetStage === 'interview_scheduled'
 ? ' Schedule Candidate Interview'
 : stageModal.targetStage === 'offered'
 ? ' Extend Employment Offer'
 : stageModal.targetStage === 'hired'
 ? ' Confirm Placement & Hire'
 : 'Update Pipeline Stage'}
 </h3>
 <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setStageModal(null)}>
 <X size={18} />
 </button>
 </div>

 <form onSubmit={handleStageSubmit}>
 <div style={{ backgroundColor: '#F9FAFB', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
 <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{stageModal.candidate.candidateName}</div>
 <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Role: {stageModal.candidate.roleApplied} • {stageModal.candidate.center}</div>
 </div>

 <div className="form-group">
 <label className="form-label">Job Role Title</label>
 <input
 type="text"
 className="form-input"
 value={modalRole}
 onChange={(e) => setModalRole(e.target.value)}
 required
 />
 </div>

 {stageModal.targetStage === 'interview_scheduled' && (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
 <div className="form-group">
 <label className="form-label">Interview Date</label>
 <input
 type="date"
 className="form-input"
 value={modalDate}
 onChange={(e) => setModalDate(e.target.value)}
 required
 />
 </div>
 <div className="form-group">
 <label className="form-label">Interview Time</label>
 <input
 type="text"
 className="form-input"
 value={modalTime}
 onChange={(e) => setModalTime(e.target.value)}
 required
 />
 </div>
 </div>
 )}

 {(stageModal.targetStage === 'offered' || stageModal.targetStage === 'hired') && (
 <div className="form-group">
 <label className="form-label">Monthly Salary (INR / mo) *</label>
 <input
 type="number"
 className="form-input"
 value={modalSalary}
 onChange={(e) => setModalSalary(Number(e.target.value))}
 required
 />
 </div>
 )}

 <div className="form-group">
 <label className="form-label">Recruiter Remarks / Instructions</label>
 <textarea
 className="form-input"
 rows={3}
 value={modalNotes}
 onChange={(e) => setModalNotes(e.target.value)}
 placeholder="e.g. Cleared round 1 roleplay. Reporting to Saket flagship store."
 />
 </div>

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
 <button
 type="button"
 style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
 onClick={() => setStageModal(null)}
 >
 Cancel
 </button>
 <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
 Confirm & Update Stage
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
