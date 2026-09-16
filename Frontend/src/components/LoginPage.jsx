import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, User, Lock, Mail, Phone, Building, MapPin } from 'lucide-react';

export const LoginPage = () => {
  const { login, register, loading } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('learner');

  // Form Fields
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

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIdentifier('');
    setPassword('');
    setName('');
    setPhone('');
    setEmail('');
    setOrganization('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'login') {
      if (!identifier.trim() || !password) {
        setErrorMsg('Please enter email or mobile number and password.');
        return;
      }
      const res = await login(identifier.trim(), password, role);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name.trim() || !password || (!phone.trim() && !email.trim())) {
        setErrorMsg('Please enter your full name, password, and at least one contact method (email or mobile number).');
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

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>{mode === 'login' ? t('login.signInTitle') : t('login.registerTitle')}</h2>
        <p>
          {mode === 'login'
            ? t('login.signInSub')
            : t('login.registerSub')}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <button
          type="button"
          className={`tab-button ${mode === 'login' ? 'active' : ''}`}
          onClick={() => {
            setMode('login');
            resetForm();
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`tab-button ${mode === 'register' ? 'active' : ''}`}
          onClick={() => {
            setMode('register');
            resetForm();
          }}
        >
          {t('login.tabRegister')}
        </button>
      </div>

      {/* Status Messages */}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        {/* Role Selector */}
        <div className="form-group">
          <label className="form-label">{t('login.roleLabel')}</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="learner">{t('login.roles.learner')}</option>
            <option value="trainer">{t('login.roles.trainer')}</option>
            <option value="employer">{t('login.roles.employer')}</option>
            <option value="admin">{t('login.roles.admin')}</option>
          </select>
        </div>

        {mode === 'register' ? (
          <>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">{t('login.fullName')}</label>
              <div className="input-wrapper">
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('login.fullName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">{t('login.emailLabel')}</label>
              <div className="input-wrapper">
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label className="form-label">{t('login.mobileLabel')}</label>
              <div className="input-wrapper">
                <Phone size={15} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t('login.mobilePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* CDC Center */}
            <div className="form-group">
              <label className="form-label">{t('login.centerLabel')}</label>
              <div className="input-wrapper">
                <MapPin size={15} className="input-icon" />
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
                <label className="form-label">{t('login.companyLabel')}</label>
                <div className="input-wrapper">
                  <Building size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('login.companyPlaceholder')}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Login Mode: Email or Mobile Number */
          <div className="form-group">
            <label className="form-label">{t('login.identifierLabel')}</label>
            <div className="input-wrapper">
              <Mail size={15} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder={t('login.identifierPlaceholder')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div className="form-group">
          <label className="form-label">{t('login.passwordLabel')}</label>
          <div className="input-wrapper">
            <Lock size={15} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="btn-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t('login.processing') : mode === 'login' ? t('login.btnSignIn') : t('login.btnRegister')}
        </button>
      </form>
    </div>
  );
};
