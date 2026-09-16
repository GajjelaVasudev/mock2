import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register, loading, DEMO_PRESETS } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('learner');

  // Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [center, setCenter] = useState('Sangam Vihar CDC');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'login') {
      if (!identifier.trim() || !password) {
        setErrorMsg('Please enter your email or phone number and password.');
        return;
      }
      const res = await login(identifier.trim(), password, role);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name.trim() || !password || (!phone.trim() && !email.trim())) {
        setErrorMsg('Please enter name, password, and phone/email.');
        return;
      }
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        center,
        organization: organization.trim(),
      });
      if (!res.success) {
        setErrorMsg(res.message || 'Registration failed.');
      }
    }
  };

  const handleDemoClick = (roleKey) => {
    const preset = DEMO_PRESETS[roleKey];
    if (preset) {
      setRole(roleKey);
      setIdentifier(preset.identifier);
      setPassword(preset.password);
      setErrorMsg('');
      login(preset.identifier, preset.password, roleKey);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>{mode === 'login' ? 'Sign In to ETASHA' : 'Create an Account'}</h2>
        <p>
          {mode === 'login'
            ? 'Access your skills and training portal'
            : 'Register for ETASHA skill development program'}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <button
          type="button"
          className={`tab-button ${mode === 'login' ? 'active' : ''}`}
          onClick={() => {
            setMode('login');
            setErrorMsg('');
            setSuccessMsg('');
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`tab-button ${mode === 'register' ? 'active' : ''}`}
          onClick={() => {
            setMode('register');
            setErrorMsg('');
            setSuccessMsg('');
          }}
        >
          Register
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Role Selector */}
        <div className="form-group">
          <label className="form-label">Select Role</label>
          <div className="input-wrapper">
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="learner">Learner / Trainee</option>
              <option value="trainer">Trainer / Facilitator</option>
              <option value="employer">Employer Partner</option>
              <option value="admin">Impact & Leadership (Admin)</option>
            </select>
          </div>
        </div>

        {mode === 'register' && (
          <>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CDC Center */}
            <div className="form-group">
              <label className="form-label">Training Center (CDC)</label>
              <div className="input-wrapper">
                <MapPin size={16} className="input-icon" />
                <select
                  className="form-select"
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                >
                  <option value="Sangam Vihar CDC">Sangam Vihar CDC</option>
                  <option value="Khanpur CDC">Khanpur CDC</option>
                  <option value="Dakshinpuri CDC">Dakshinpuri CDC</option>
                  <option value="Mangolpuri CDC">Mangolpuri CDC</option>
                  <option value="Partner ITI / WCSC">Partner ITI / WCSC</option>
                  <option value="Central HQ">Central HQ</option>
                </select>
              </div>
            </div>

            {role === 'employer' && (
              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <div className="input-wrapper">
                  <Building size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter company name"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Email or Phone */}
        <div className="form-group">
          <label className="form-label">
            {mode === 'login' ? 'Email or Mobile Number' : 'Mobile Number / Email'}
          </label>
          <div className="input-wrapper">
            {mode === 'login' ? (
              <Mail size={16} className="input-icon" />
            ) : (
              <Phone size={16} className="input-icon" />
            )}
            <input
              type="text"
              className="form-input"
              placeholder={
                mode === 'login'
                  ? 'e.g. 9876543210 or user@etasha.org'
                  : 'Enter 10-digit mobile or email'
              }
              value={mode === 'login' ? identifier : phone || email}
              onChange={(e) => {
                const val = e.target.value;
                if (mode === 'login') {
                  setIdentifier(val);
                } else {
                  if (val.includes('@')) {
                    setEmail(val);
                  } else {
                    setPhone(val);
                  }
                }
              }}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="btn-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span>Processing...</span>
          ) : mode === 'login' ? (
            <>
              <LogIn size={16} />
              <span>Sign In</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Section */}
      <div className="demo-section">
        <div className="demo-title">One-Click Demo Login</div>
        <div className="demo-buttons">
          <button
            type="button"
            className="btn-demo"
            onClick={() => handleDemoClick('learner')}
          >
            Learner (Pooja)
          </button>
          <button
            type="button"
            className="btn-demo"
            onClick={() => handleDemoClick('trainer')}
          >
            Trainer (Sunita)
          </button>
          <button
            type="button"
            className="btn-demo"
            onClick={() => handleDemoClick('employer')}
          >
            Employer (Apex)
          </button>
          <button
            type="button"
            className="btn-demo"
            onClick={() => handleDemoClick('admin')}
          >
            Admin (Team)
          </button>
        </div>
      </div>
    </div>
  );
};
