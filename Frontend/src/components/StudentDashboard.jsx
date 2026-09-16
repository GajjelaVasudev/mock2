import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Calendar, Award, Mic, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MockInterview } from './MockInterview';

const PRACTICE_QUESTIONS = [
  'Tell me about yourself.',
  'Why do you want to work in this field?',
  'Describe a time you handled a difficult customer or situation.',
  'What are your strengths and weaknesses?',
  'Where do you see yourself in two years?'
];

const TABS = [
  { key: 'overview', label: 'Overview', icon: TrendingUp },
  { key: 'modules', label: 'Learning', icon: BookOpen },
  { key: 'mock-interview', label: 'Mock Interview', icon: Mic },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'badges', label: 'Badges', icon: Award },
  { key: 'community', label: 'Community', icon: Users }
];

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Request to ${url} failed (${res.status})`);
  return res.json();
}

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [modules, setModules] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [badges, setBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadOverview() {
      try {
        const [profileData, assessmentData] = await Promise.all([
          fetchJson('/api/learners/me'),
          fetchJson('/api/learners/me/assessments')
        ]);
        setProfile(profileData.learner);
        setAssessments(assessmentData);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'modules' && modules.length === 0) {
      fetchJson('/api/content/modules').then((d) => setModules(d.modules || [])).catch((e) => setErrorMsg(e.message));
    }
    if (activeTab === 'attendance' && !attendance) {
      fetchJson('/api/learners/me/attendance').then(setAttendance).catch((e) => setErrorMsg(e.message));
    }
    if (activeTab === 'badges' && badges.length === 0) {
      fetchJson('/api/learners/me/badges').then((d) => setBadges(d.badges || [])).catch((e) => setErrorMsg(e.message));
    }
    if (activeTab === 'community' && posts.length === 0) {
      fetchJson('/api/community/posts').then((d) => setPosts(d.posts || [])).catch((e) => setErrorMsg(e.message));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const randomQuestion =
    PRACTICE_QUESTIONS[Math.floor(Math.random() * PRACTICE_QUESTIONS.length)];

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name || user?.username}</h1>
          {profile && <p>{profile.center || 'Center not set'} · {profile.cohort || 'Cohort not set'}</p>}
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <nav className="dashboard-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={activeTab === key ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      {errorMsg && <p className="error-text">{errorMsg}</p>}
      {loading && activeTab === 'overview' && <p>Loading your progress...</p>}

      <main className="dashboard-content">
        {activeTab === 'overview' && assessments && (
          <section>
            <h2>Your Skill Progress</h2>
            {assessments.summary.length === 0 ? (
              <p>No assessments yet — try a self-assessment or a mock interview to get started.</p>
            ) : (
              <div className="skill-summary-grid">
                {assessments.summary.map((s) => (
                  <div key={s.skillCategory} className="skill-card">
                    <h3>{s.skillCategory}</h3>
                    <p>Average: {s.average}/10</p>
                    <p>Latest: {s.latest}/10</p>
                    <p>{s.totalEntries} entries</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'modules' && (
          <section>
            <h2>Learning Modules</h2>
            <div className="module-list">
              {modules.map((m) => (
                <div key={m._id} className="module-card">
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  <span className="tag">{m.skillCategory}</span>
                </div>
              ))}
              {modules.length === 0 && <p>No modules available yet.</p>}
            </div>
          </section>
        )}

        {activeTab === 'mock-interview' && (
          <section>
            <h2>Practice Interview</h2>
            <MockInterview question={randomQuestion} />
          </section>
        )}

        {activeTab === 'attendance' && attendance && (
          <section>
            <h2>Attendance</h2>
            <p>{attendance.attendancePercent}% attendance ({attendance.presentCount}/{attendance.totalSessions} sessions)</p>
          </section>
        )}

        {activeTab === 'badges' && (
          <section>
            <h2>Your Badges</h2>
            <div className="badge-list">
              {badges.map((b) => (
                <div key={b._id} className="badge-card">
                  <span className="badge-icon">{b.badge?.icon || '🏅'}</span>
                  <h3>{b.badge?.name}</h3>
                  <p>{b.badge?.description}</p>
                </div>
              ))}
              {badges.length === 0 && <p>No badges earned yet — keep practicing!</p>}
            </div>
          </section>
        )}

        {activeTab === 'community' && (
          <section>
            <h2>Community</h2>
            <div className="post-list">
              {posts.map((p) => (
                <div key={p._id} className="post-card">
                  <strong>{p.author?.username}</strong>
                  <p>{p.content}</p>
                </div>
              ))}
              {posts.length === 0 && <p>No posts yet — be the first to share something!</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;