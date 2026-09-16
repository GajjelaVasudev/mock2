import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Mic,
  Users,
  UserPlus,
  Briefcase,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MockInterview } from './MockInterview';

const PRACTICE_QUESTIONS = [
  'Tell me about yourself.',
  'Why do you want to work in this field?',
  'Describe a time you handled a difficult customer or situation.',
  'What are your strengths and weaknesses?',
  'Where do you see yourself in two years?'
];

const SKILL_CATEGORIES = [
  { value: 'communication', label: 'Communication' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'teamwork', label: 'Teamwork' },
  { value: 'interview-readiness', label: 'Interview Readiness' },
  { value: 'etiquette', label: 'Workplace Etiquette' }
];

async function fetchJson(url, options) {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request to ${url} failed (${res.status})`);
  return data;
}

function postJson(url, body) {
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const isAlumni = user?.role === 'alumni';

  const TABS = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'modules', label: 'Learning', icon: BookOpen },
    { key: 'mock-interview', label: 'Mock Interview', icon: Mic },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'badges', label: 'Badges', icon: Award },
    { key: 'community', label: 'Community', icon: Users },
    { key: 'mentors', label: 'Mentors', icon: UserPlus },
    ...(isAlumni ? [{ key: 'placement', label: 'My Placement', icon: Briefcase }] : [])
  ];

  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [modules, setModules] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [badges, setBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // --- self-assessment form state ---
  const [assessCategory, setAssessCategory] = useState('communication');
  const [assessScore, setAssessScore] = useState(5);
  const [assessNotes, setAssessNotes] = useState('');
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [assessmentMsg, setAssessmentMsg] = useState('');

  // --- community form state ---
  const [newPostContent, setNewPostContent] = useState('');
  const [postingContent, setPostingContent] = useState(false);
  const [openPostId, setOpenPostId] = useState(null);
  const [repliesByPost, setRepliesByPost] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});

  // --- mentorship form state ---
  const [mentorMessages, setMentorMessages] = useState({});
  const [requestedMentorIds, setRequestedMentorIds] = useState([]);
  const [mentorMsg, setMentorMsg] = useState('');

  function reloadAssessments() {
    return fetchJson('/api/learners/me/assessments').then(setAssessments);
  }

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
    if (activeTab === 'community') {
      if (posts.length === 0) {
        fetchJson('/api/community/posts').then((d) => setPosts(d.posts || [])).catch((e) => setErrorMsg(e.message));
      }
      if (successStories.length === 0) {
        fetchJson('/api/community/success-stories').then((d) => setSuccessStories(d.stories || [])).catch((e) => setErrorMsg(e.message));
      }
    }
    if (activeTab === 'mentors' && mentors.length === 0) {
      fetchJson('/api/mentors').then((d) => setMentors(d.mentors || [])).catch((e) => setErrorMsg(e.message));
    }
    if (activeTab === 'placement' && isAlumni && !placement) {
      fetchJson('/api/alumni/me/placement').then(setPlacement).catch((e) => setErrorMsg(e.message));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const randomQuestion =
    PRACTICE_QUESTIONS[Math.floor(Math.random() * PRACTICE_QUESTIONS.length)];

  async function handleSubmitAssessment(e) {
    e.preventDefault();
    setSubmittingAssessment(true);
    setAssessmentMsg('');
    try {
      await postJson('/api/self-assessments', {
        skillCategory: assessCategory,
        score: Number(assessScore),
        notes: assessNotes.trim() || undefined
      });
      setAssessmentMsg('Self-assessment submitted!');
      setAssessNotes('');
      await reloadAssessments();
    } catch (err) {
      setAssessmentMsg(err.message);
    } finally {
      setSubmittingAssessment(false);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPostingContent(true);
    try {
      await postJson('/api/community/posts', { content: newPostContent.trim() });
      setNewPostContent('');
      const d = await fetchJson('/api/community/posts');
      setPosts(d.posts || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPostingContent(false);
    }
  }

  async function toggleReplies(postId) {
    if (openPostId === postId) {
      setOpenPostId(null);
      return;
    }
    setOpenPostId(postId);
    if (!repliesByPost[postId]) {
      try {
        const d = await fetchJson(`/api/community/posts/${postId}/replies`);
        setRepliesByPost((prev) => ({ ...prev, [postId]: d.replies || [] }));
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  }

  async function handleAddReply(postId) {
    const content = (replyDrafts[postId] || '').trim();
    if (!content) return;
    try {
      await postJson(`/api/community/posts/${postId}/replies`, { content });
      setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
      const d = await fetchJson(`/api/community/posts/${postId}/replies`);
      setRepliesByPost((prev) => ({ ...prev, [postId]: d.replies || [] }));
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleRequestMentorship(mentorId) {
    setMentorMsg('');
    try {
      await postJson('/api/mentorship/requests', {
        mentorId,
        message: mentorMessages[mentorId] || undefined
      });
      setRequestedMentorIds((prev) => [...prev, mentorId]);
      setMentorMsg('Mentorship request sent!');
    } catch (err) {
      setMentorMsg(err.message);
    }
  }

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

            <h2 className="section-heading-spaced">Quick Self-Assessment</h2>
            <form className="assessment-form" onSubmit={handleSubmitAssessment}>
              <div className="form-row">
                <label htmlFor="assessCategory">Skill</label>
                <select
                  id="assessCategory"
                  value={assessCategory}
                  onChange={(e) => setAssessCategory(e.target.value)}
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="assessScore">How confident do you feel? ({assessScore}/10)</label>
                <input
                  id="assessScore"
                  type="range"
                  min="1"
                  max="10"
                  value={assessScore}
                  onChange={(e) => setAssessScore(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="assessNotes">Notes (optional)</label>
                <textarea
                  id="assessNotes"
                  rows={2}
                  placeholder="What did you practice or struggle with?"
                  value={assessNotes}
                  onChange={(e) => setAssessNotes(e.target.value)}
                />
              </div>
              <button type="submit" className="primary-btn" disabled={submittingAssessment}>
                {submittingAssessment ? 'Submitting...' : 'Submit Self-Assessment'}
              </button>
              {assessmentMsg && <p className="form-msg">{assessmentMsg}</p>}
            </form>
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

            <form className="post-form" onSubmit={handleCreatePost}>
              <textarea
                rows={2}
                placeholder="Share something with the community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <button type="submit" className="primary-btn" disabled={postingContent || !newPostContent.trim()}>
                {postingContent ? 'Posting...' : 'Post'}
              </button>
            </form>

            <div className="post-list">
              {posts.map((p) => (
                <div key={p._id} className="post-card">
                  <strong>{p.author?.username} <span className="tag">{p.author?.role}</span></strong>
                  <p>{p.content}</p>
                  <button className="link-btn" onClick={() => toggleReplies(p._id)}>
                    <MessageCircle size={14} /> {openPostId === p._id ? 'Hide replies' : 'View replies'}
                  </button>

                  {openPostId === p._id && (
                    <div className="reply-thread">
                      {(repliesByPost[p._id] || []).map((r) => (
                        <div key={r._id} className="reply-item">
                          <strong>{r.author?.username}</strong>
                          <p>{r.content}</p>
                        </div>
                      ))}
                      {(repliesByPost[p._id] || []).length === 0 && <p>No replies yet.</p>}

                      <div className="reply-input-row">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyDrafts[p._id] || ''}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [p._id]: e.target.value }))
                          }
                        />
                        <button className="primary-btn small" onClick={() => handleAddReply(p._id)}>
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {posts.length === 0 && <p>No posts yet — be the first to share something!</p>}
            </div>

            {successStories.length > 0 && (
              <>
                <h2 className="section-heading-spaced">Success Stories</h2>
                <div className="post-list">
                  {successStories.map((s, idx) => (
                    <div key={idx} className="post-card">
                      <strong>{s.name}</strong>
                      <p>
                        Placed at {s.company || 'a partner company'} as {s.role || 'an entry-level hire'}
                        {s.center ? ` · ${s.center}` : ''}
                      </p>
                      {s.growth && (
                        <span className="tag">
                          {s.growth.skillCategory}: {s.growth.from} → {s.growth.to}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'mentors' && (
          <section>
            <h2>Alumni Mentors</h2>
            {mentorMsg && <p className="form-msg">{mentorMsg}</p>}
            <div className="module-list">
              {mentors.map((m) => (
                <div key={m._id} className="module-card">
                  <h3>{m.user?.username}</h3>
                  <p>{m.mentorBio || 'Available for mentorship.'}</p>
                  {m.placedCompany && <span className="tag">{m.placedRole} @ {m.placedCompany}</span>}

                  {requestedMentorIds.includes(m._id) ? (
                    <p className="form-msg">Request sent</p>
                  ) : (
                    <div className="reply-input-row">
                      <input
                        type="text"
                        placeholder="Short message (optional)"
                        value={mentorMessages[m._id] || ''}
                        onChange={(e) =>
                          setMentorMessages((prev) => ({ ...prev, [m._id]: e.target.value }))
                        }
                      />
                      <button className="primary-btn small" onClick={() => handleRequestMentorship(m._id)}>
                        Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {mentors.length === 0 && <p>No mentors available right now — check back soon.</p>}
            </div>
          </section>
        )}

        {activeTab === 'placement' && isAlumni && (
          <section>
            <h2>My Placement</h2>
            {placement ? (
              <div className="skill-card">
                <h3>{placement.placementStatus}</h3>
                {placement.company && <p>Company: {placement.company}</p>}
                {placement.role && <p>Role: {placement.role}</p>}
                {placement.placedDate && (
                  <p>Placed on: {new Date(placement.placedDate).toLocaleDateString()}</p>
                )}
              </div>
            ) : (
              <p>Loading placement details...</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;