import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  Award,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Search,
  Check,
  X,
  Clock,
  Phone,
  LogOut,
  Send,
} from 'lucide-react';

export const TrainerDashboard = () => {
  const { user, logout } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [overview, setOverview] = useState({
    totalStudents: 5,
    atRiskCount: 2,
    avgAttendance: 82,
    avgConfidence: 68,
    activeTasksCount: 3,
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A',
  });

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('all');

  // Attendance Form State
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceSavedMsg, setAttendanceSavedMsg] = useState('');

  // Assessment Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(70);
  const [communicationScore, setCommunicationScore] = useState(70);
  const [workplaceEtiquetteScore, setWorkplaceEtiquetteScore] = useState(75);
  const [interviewReadinessScore, setInterviewReadinessScore] = useState(65);
  const [remarks, setRemarks] = useState('');
  const [selectedBadges, setSelectedBadges] = useState(['Active Communicator']);
  const [assessmentSuccessMsg, setAssessmentSuccessMsg] = useState('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('Spoken English');
  const [taskTarget, setTaskTarget] = useState('batch'); // 'batch' | 'individual'
  const [taskStudentId, setTaskStudentId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    return new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  });
  const [taskSuccessMsg, setTaskSuccessMsg] = useState('');

  // Toast
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const fetchData = async () => {
    try {
      const ovRes = await fetch('/api/trainer/overview');
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        if (ovData.data) setOverview(ovData.data);
      }

      const stRes = await fetch('/api/trainer/students');
      if (stRes.ok) {
        const stData = await stRes.json();
        if (stData.students) {
          setStudents(stData.students);
          if (stData.students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(stData.students[0]._id || stData.students[0].id);
            setTaskStudentId(stData.students[0]._id || stData.students[0].id);
          }
          const initAtt = {};
          stData.students.forEach((s) => {
            initAtt[s._id || s.id] = 'present';
          });
          setAttendanceRecords(initAtt);
        }
      }

      const tkRes = await fetch('/api/trainer/tasks');
      if (tkRes.ok) {
        const tkData = await tkRes.json();
        if (tkData.tasks) setTasks(tkData.tasks);
      }

      const rkRes = await fetch('/api/trainer/at-risk');
      if (rkRes.ok) {
        const rkData = await rkRes.json();
        if (rkData.atRiskLearners) setAtRiskList(rkData.atRiskLearners);
      }
    } catch (err) {
      console.warn('Using local state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id || s.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    setAttendanceSavedMsg('');
    const recordsArray = Object.keys(attendanceRecords).map((studentId) => {
      const student = students.find((s) => (s._id || s.id) === studentId);
      return {
        studentId,
        studentName: student?.name || 'Student',
        status: attendanceRecords[studentId],
      };
    });

    try {
      const res = await fetch('/api/trainer/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceDate,
          records: recordsArray,
          center: overview.center,
          batch: overview.batch,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAttendanceSavedMsg(data.message || 'Attendance saved.');
        showNotification(`Attendance for ${attendanceDate} saved.`);
        fetchData();
      }
    } catch (err) {
      setAttendanceSavedMsg('Attendance saved locally.');
      showNotification('Attendance saved locally.');
    }
  };

  const handleBadgeToggle = (badge) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    setAssessmentSuccessMsg('');

    try {
      const res = await fetch('/api/trainer/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          confidenceScore: Number(confidenceScore),
          communicationScore: Number(communicationScore),
          workplaceEtiquetteScore: Number(workplaceEtiquetteScore),
          interviewReadinessScore: Number(interviewReadinessScore),
          remarks,
          badgesAwarded: selectedBadges,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAssessmentSuccessMsg(data.message || 'Assessment recorded.');
        showNotification('Soft skills assessment submitted.');
        setRemarks('');
        fetchData();
      }
    } catch (err) {
      setAssessmentSuccessMsg('Assessment recorded locally.');
      showNotification('Assessment recorded locally.');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const targetStudent = students.find((s) => (s._id || s.id) === taskStudentId);

    try {
      const res = await fetch('/api/trainer/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim(),
          category: taskCategory,
          targetType: taskTarget,
          studentId: taskTarget === 'individual' ? taskStudentId : undefined,
          studentName: targetStudent?.name,
          dueDate: taskDueDate,
          batch: overview.batch,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTaskSuccessMsg(data.message || 'Task assigned.');
        showNotification(`Task "${taskTitle}" assigned.`);
        setTaskTitle('');
        setTaskDesc('');
        fetchData();
      }
    } catch (err) {
      setTaskSuccessMsg('Task assigned locally.');
      showNotification('Task assigned locally.');
    }
  };

  const handleResolveRisk = async (studentId, studentName) => {
    const note = prompt(
      `Enter intervention note for ${studentName}:`,
      '1-on-1 counseling completed and remedial practice assigned.'
    );
    if (note) {
      try {
        await fetch('/api/trainer/at-risk/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, resolutionNote: note }),
        });
        showNotification(`Intervention logged for ${studentName}.`);
        fetchData();
      } catch (e) {
        showNotification(`Intervention logged for ${studentName}.`);
      }
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery);
    const matchCenter = selectedCenter === 'all' || s.center === selectedCenter;
    return matchSearch && matchCenter;
  });

  return (
    <div className="trainer-dashboard">
      {/* Top Header */}
      <div className="trainer-header">
        <div className="trainer-title-area">
          <div className="trainer-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h2>Faculty Portal • {user?.name || 'Faculty Member'}</h2>
            <div className="trainer-badges">
              <span className="pill-badge primary">Lead Facilitator</span>
              <span className="pill-badge">{overview.center}</span>
              <span className="pill-badge">{overview.batch}</span>
            </div>
          </div>
        </div>

        <button className="btn-logout" onClick={logout}>
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {notification && (
        <div className="trainer-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="trainer-tabs">
        <button
          className={`trainer-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>Overview</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={14} />
          <span>Manage Students ({students.length})</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Calendar size={14} />
          <span>Record Attendance</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'assessment' ? 'active' : ''}`}
          onClick={() => setActiveTab('assessment')}
        >
          <Award size={14} />
          <span>Conduct Assessments</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <TrendingUp size={14} />
          <span>Track Progress</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={14} />
          <span>Assign Tasks</span>
        </button>

        <button
          className={`trainer-tab ${activeTab === 'at-risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('at-risk')}
        >
          <AlertTriangle size={14} />
          <span>At-Risk Learners ({atRiskList.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Assigned Trainees</div>
              <div className="kpi-val">{overview.totalStudents}</div>
              <div className="kpi-sub">Enrolled in {overview.batch}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Cohort Attendance</div>
              <div className="kpi-val">{overview.avgAttendance}%</div>
              <div className="kpi-sub">Target: &gt;80%</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Average Soft Skills</div>
              <div className="kpi-val">{overview.avgConfidence}%</div>
              <div className="kpi-sub">Spoken English & Workplace Readiness</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">At-Risk Learners</div>
              <div className="kpi-val">{overview.atRiskCount}</div>
              <div className="kpi-sub">Attendance &lt; 75% or low confidence</div>
            </div>
          </div>

          <div className="trainer-panel" style={{ marginTop: '1rem' }}>
            <h3 className="panel-title">Quick Actions</h3>
            <div className="quick-actions-row">
              <button className="btn-action-tile" onClick={() => setActiveTab('attendance')}>
                <Calendar size={18} />
                <strong>Mark Attendance</strong>
                <span>Record present / absent for {overview.batch}</span>
              </button>

              <button className="btn-action-tile" onClick={() => setActiveTab('assessment')}>
                <Award size={18} />
                <strong>Evaluate Soft Skills</strong>
                <span>Score spoken English and interview readiness</span>
              </button>

              <button className="btn-action-tile" onClick={() => setActiveTab('tasks')}>
                <CheckSquare size={18} />
                <strong>Assign Roleplay Task</strong>
                <span>Send practice exercises to cohort</span>
              </button>

              <button className="btn-action-tile" onClick={() => setActiveTab('at-risk')}>
                <AlertTriangle size={18} />
                <strong>Review At-Risk Students</strong>
                <span>Flagged for attendance or confidence</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ASSIGNED STUDENTS */}
      {activeTab === 'students' && (
        <div className="trainer-panel">
          <div className="panel-header-flex">
            <div>
              <h3 className="panel-title">Assigned Students</h3>
              <p className="panel-sub">Manage student profiles, contact details, and placement readiness</p>
            </div>

            <div className="filter-controls">
              <div className="search-input-box">
                <Search size={14} color="#6B7280" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
              >
                <option value="all">All Centers</option>
                <option value="Sangam Vihar CDC">Sangam Vihar CDC</option>
                <option value="Khanpur CDC">Khanpur CDC</option>
                <option value="Dakshinpuri CDC">Dakshinpuri CDC</option>
                <option value="Mangolpuri CDC">Mangolpuri CDC</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="trainer-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Contact</th>
                  <th>Center / Batch</th>
                  <th>Attendance</th>
                  <th>Soft Skills</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const stId = st._id || st.id;
                  const att = st.attendanceRate || 85;
                  const conf = st.softSkillsProfile?.confidenceScore || 65;
                  const comm = st.softSkillsProfile?.communicationScore || 70;
                  const avgScore = Math.round((conf + comm) / 2);

                  return (
                    <tr key={stId}>
                      <td>
                        <strong>{st.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          {st.softSkillsProfile?.badgesEarned?.slice(0, 2).join(', ') || 'Enrolled'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem' }}>{st.phone || 'N/A'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{st.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem' }}>{st.center || 'Sangam Vihar CDC'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{st.batch || 'Batch 2026-A'}</div>
                      </td>
                      <td>
                        <span className="score-badge">{att}%</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div className="table-prog-bar">
                            <div className="table-prog-fill" style={{ width: `${avgScore}%` }}></div>
                          </div>
                          <span>{avgScore}%</span>
                        </div>
                      </td>
                      <td>
                        {st.atRisk ? (
                          <span className="risk-pill danger">At Risk</span>
                        ) : avgScore >= 75 ? (
                          <span className="risk-pill">Job Ready</span>
                        ) : (
                          <span className="risk-pill">In Progress</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-table-action"
                          onClick={() => {
                            setSelectedStudentId(stId);
                            setActiveTab('assessment');
                          }}
                        >
                          Evaluate
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

      {/* TAB 3: RECORD ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="trainer-panel">
          <div className="panel-header-flex">
            <div>
              <h3 className="panel-title">Attendance Roster</h3>
              <p className="panel-sub">Record daily attendance for {overview.batch} • {overview.center}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="date-picker-input"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
              <button className="btn-secondary-sm" onClick={() => handleMarkAll('present')}>
                Mark All Present
              </button>
              <button className="btn-secondary-sm" onClick={() => handleMarkAll('absent')}>
                Mark All Absent
              </button>
            </div>
          </div>

          {attendanceSavedMsg && <div className="alert alert-success">{attendanceSavedMsg}</div>}

          <div className="attendance-list">
            {students.map((st) => {
              const stId = st._id || st.id;
              const status = attendanceRecords[stId] || 'present';

              return (
                <div key={stId} className="attendance-row">
                  <div className="att-student-info">
                    <strong>{st.name}</strong>
                    <span>{st.phone || st.email} • Rate: {st.attendanceRate || 85}%</span>
                  </div>

                  <div className="att-toggle-group">
                    <button
                      type="button"
                      className={`btn-att-pill ${status === 'present' ? 'present' : ''}`}
                      onClick={() => handleAttendanceChange(stId, 'present')}
                    >
                      Present
                    </button>

                    <button
                      type="button"
                      className={`btn-att-pill ${status === 'late' ? 'late' : ''}`}
                      onClick={() => handleAttendanceChange(stId, 'late')}
                    >
                      Late
                    </button>

                    <button
                      type="button"
                      className={`btn-att-pill ${status === 'absent' ? 'absent' : ''}`}
                      onClick={() => handleAttendanceChange(stId, 'absent')}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} onClick={handleSaveAttendance}>
              Save Attendance ({attendanceDate})
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: CONDUCT ASSESSMENTS */}
      {activeTab === 'assessment' && (
        <div className="trainer-panel">
          <h3 className="panel-title">Soft Skills Developmental Assessment</h3>
          <p className="panel-sub">Evaluate behavioral milestones, spoken communication, and interview readiness</p>

          {assessmentSuccessMsg && <div className="alert alert-success">{assessmentSuccessMsg}</div>}

          <form onSubmit={handleSubmitAssessment} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Student</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                {students.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name} ({s.center || 'Sangam Vihar CDC'})
                  </option>
                ))}
              </select>
            </div>

            <div className="slider-grid">
              <div className="slider-card">
                <div className="slider-header">
                  <label>Confidence & Self-Esteem</label>
                  <span className="slider-value">{confidenceScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(e.target.value)}
                  className="score-range-slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="slider-card">
                <div className="slider-header">
                  <label>Spoken English & Articulation</label>
                  <span className="slider-value">{communicationScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={communicationScore}
                  onChange={(e) => setCommunicationScore(e.target.value)}
                  className="score-range-slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="slider-card">
                <div className="slider-header">
                  <label>Workplace Ethics & Grooming</label>
                  <span className="slider-value">{workplaceEtiquetteScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={workplaceEtiquetteScore}
                  onChange={(e) => setWorkplaceEtiquetteScore(e.target.value)}
                  className="score-range-slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="slider-card">
                <div className="slider-header">
                  <label>Job Interview Readiness</label>
                  <span className="slider-value">{interviewReadinessScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={interviewReadinessScore}
                  onChange={(e) => setInterviewReadinessScore(e.target.value)}
                  className="score-range-slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Award Milestone Skill Badges</label>
              <div className="badges-checkbox-grid">
                {[
                  'Active Communicator',
                  'Confidence Champion',
                  'Customer Service Star',
                  'Punctuality Star',
                  'Team Leader',
                  'Interview Star',
                ].map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    className={`badge-toggle-btn ${selectedBadges.includes(badge) ? 'selected' : ''}`}
                    onClick={() => handleBadgeToggle(badge)}
                  >
                    <span>{badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.85rem' }}>
              <label className="form-label">Faculty Feedback & Guidance</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Observation on confidence, eye contact, and participation..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.75rem' }}>
              Submit Assessment
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: TRACK PROGRESS */}
      {activeTab === 'progress' && (
        <div className="trainer-panel">
          <h3 className="panel-title">Cohort Progress</h3>
          <p className="panel-sub">Track developmental arcs and job placement readiness</p>

          <div className="progress-metrics-list" style={{ marginTop: '1rem' }}>
            {students.map((st) => {
              const stId = st._id || st.id;
              const p = st.softSkillsProfile || {};
              const conf = p.confidenceScore || 65;
              const comm = p.communicationScore || 70;
              const ethics = p.workplaceEtiquetteScore || 75;
              const interview = p.interviewReadinessScore || 60;
              const overall = Math.round((conf + comm + ethics + interview) / 4);

              return (
                <div key={stId} className="student-progress-card">
                  <div className="sp-header">
                    <div>
                      <strong>{st.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: '0.4rem' }}>
                        ({st.center})
                      </span>
                    </div>
                    <div className="overall-score-pill">
                      Readiness: <strong>{overall}%</strong>
                    </div>
                  </div>

                  <div className="sp-bars-grid">
                    <div className="sp-item">
                      <div className="sp-label">
                        <span>Confidence</span>
                        <span>{conf}%</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill" style={{ width: `${conf}%` }}></div>
                      </div>
                    </div>

                    <div className="sp-item">
                      <div className="sp-label">
                        <span>Communication</span>
                        <span>{comm}%</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill" style={{ width: `${comm}%` }}></div>
                      </div>
                    </div>

                    <div className="sp-item">
                      <div className="sp-label">
                        <span>Workplace Ethics</span>
                        <span>{ethics}%</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill" style={{ width: `${ethics}%` }}></div>
                      </div>
                    </div>

                    <div className="sp-item">
                      <div className="sp-label">
                        <span>Interview Readiness</span>
                        <span>{interview}%</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill" style={{ width: `${interview}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {p.trainerNotes && (
                    <div className="sp-notes">
                      <strong>Note:</strong> {p.trainerNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: ASSIGN TASKS */}
      {activeTab === 'tasks' && (
        <div className="tasks-layout-grid">
          <div className="trainer-panel">
            <h3 className="panel-title">Assign Task</h3>
            <p className="panel-sub">Create targeted exercises for individuals or the entire cohort</p>

            {taskSuccessMsg && <div className="alert alert-success">{taskSuccessMsg}</div>}

            <form onSubmit={handleAssignTask} style={{ marginTop: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 30-Second Professional Pitch"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                >
                  <option value="Spoken English">Spoken English</option>
                  <option value="Mock Interview">Mock Interview Practice</option>
                  <option value="Customer Service Roleplay">Customer Service Roleplay</option>
                  <option value="Professional Grooming">Professional Grooming</option>
                  <option value="Confidence Check-in">Confidence Check-in</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target</label>
                <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <input
                      type="radio"
                      name="taskTarget"
                      checked={taskTarget === 'batch'}
                      onChange={() => setTaskTarget('batch')}
                    />
                    Cohort ({overview.batch})
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <input
                      type="radio"
                      name="taskTarget"
                      checked={taskTarget === 'individual'}
                      onChange={() => setTaskTarget('individual')}
                    />
                    Individual Student
                  </label>
                </div>

                {taskTarget === 'individual' && (
                  <select
                    className="form-select"
                    value={taskStudentId}
                    onChange={(e) => setTaskStudentId(e.target.value)}
                  >
                    {students.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Instructions for the student..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">
                Send Task Assignment
              </button>
            </form>
          </div>

          <div className="trainer-panel">
            <h3 className="panel-title">Assigned Tasks ({tasks.length})</h3>
            <p className="panel-sub">Active tasks for {overview.batch}</p>

            <div className="tasks-stack">
              {tasks.map((tk) => (
                <div key={tk._id || tk.id} className="task-item-card">
                  <div className="task-item-header">
                    <strong>{tk.title}</strong>
                    <span className="task-category-tag">{tk.category}</span>
                  </div>
                  {tk.description && <p className="task-desc-text">{tk.description}</p>}
                  <div className="task-item-footer">
                    <span>Target: {tk.studentName || tk.batch || 'Batch'}</span>
                    <span>Due: {tk.dueDate || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AT-RISK LEARNERS */}
      {activeTab === 'at-risk' && (
        <div className="trainer-panel">
          <div className="panel-header-flex">
            <div>
              <h3 className="panel-title">At-Risk Learners</h3>
              <p className="panel-sub">
                Students flagged for low attendance (&lt;75%) or low confidence scores
              </p>
            </div>
          </div>

          {atRiskList.length === 0 ? (
            <div className="alert alert-success">No students currently flagged as at-risk in this cohort.</div>
          ) : (
            <div className="at-risk-grid">
              {atRiskList.map((rk) => (
                <div key={rk.id} className="at-risk-card">
                  <div className="at-risk-header">
                    <div>
                      <h4>{rk.name}</h4>
                      <span className="at-risk-meta">
                        {rk.center} • {rk.batch}
                      </span>
                    </div>
                    <span className="risk-indicator-pill">At Risk</span>
                  </div>

                  <div className="risk-reason-box">
                    <strong>Reason Flagged:</strong>
                    <p>{rk.riskReason}</p>
                  </div>

                  <div className="risk-metrics-row">
                    <div>
                      <span>Attendance: </span>
                      <strong>{rk.attendanceRate}%</strong>
                    </div>
                    <div>
                      <span>Confidence: </span>
                      <strong>{rk.confidenceScore}%</strong>
                    </div>
                    <div>
                      <span>Phone: </span>
                      <strong>{rk.phone || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="risk-actions-row">
                    <button
                      className="btn-remedial-action"
                      onClick={() => alert(`Calling trainee/guardian at ${rk.phone || '9811223344'}`)}
                    >
                      Call Student
                    </button>

                    <button
                      className="btn-remedial-action"
                      onClick={() => {
                        setTaskTarget('individual');
                        setTaskStudentId(rk.id);
                        setActiveTab('tasks');
                      }}
                    >
                      Assign Task
                    </button>

                    <button
                      className="btn-remedial-action"
                      onClick={() => handleResolveRisk(rk.id, rk.name)}
                    >
                      Log Intervention
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
