import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={i18n.language || 'en'}
      onChange={handleLanguageChange}
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        border: '1px solid #D1D5DB',
        backgroundColor: '#FFFFFF',
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
    >
      <option value="en">English</option>
      <option value="hi">हिंदी (Hindi)</option>
      <option value="bn">বাংলা (Bengali)</option>
      <option value="te">తెలుగు (Telugu)</option>
      <option value="mr">मराठी (Marathi)</option>
      <option value="ta">தமிழ் (Tamil)</option>
    </select>
  );
};
