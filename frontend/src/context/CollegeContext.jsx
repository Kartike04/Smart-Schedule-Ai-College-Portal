import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const CollegeContext = createContext();

export const CollegeProvider = ({ children }) => {
  const [collegeName, setCollegeName] = useState('Thakur Shyamnarayan Degree College');
  const [collegeCode, setCollegeCode] = useState('TSDC');
  const [subtitle, setSubtitle] = useState('Timetable Portal');
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeSettings();
  }, []);

  const fetchCollegeSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data) {
        if (res.data.collegeName) setCollegeName(res.data.collegeName);
        if (res.data.collegeCode) setCollegeCode(res.data.collegeCode);
        if (res.data.subtitle) setSubtitle(res.data.subtitle);
        if (res.data.logoUrl) setLogoUrl(res.data.logoUrl);
      }
    } catch (err) {
      console.log('Using default college settings');
    } finally {
      setLoading(false);
    }
  };

  const updateCollegeSettings = async ({ newName, newCode, newSubtitle, newLogo }) => {
    const payload = {
      collegeName: newName !== undefined ? newName : collegeName,
      collegeCode: newCode !== undefined ? newCode : collegeCode,
      subtitle: newSubtitle !== undefined ? newSubtitle : subtitle,
      logoUrl: newLogo !== undefined ? newLogo : logoUrl
    };

    if (payload.collegeName) setCollegeName(payload.collegeName);
    if (payload.collegeCode) setCollegeCode(payload.collegeCode);
    if (payload.subtitle) setSubtitle(payload.subtitle);
    if (payload.logoUrl) setLogoUrl(payload.logoUrl);

    try {
      const res = await API.post('/settings', payload);
      if (res.data.settings) {
        setCollegeName(res.data.settings.collegeName);
        setCollegeCode(res.data.settings.collegeCode);
        setSubtitle(res.data.settings.subtitle);
        setLogoUrl(res.data.settings.logoUrl);
      }
    } catch (err) {
      console.error('Failed to save college settings to MongoDB:', err);
    }
  };

  return (
    <CollegeContext.Provider value={{
      collegeName,
      collegeCode,
      subtitle,
      logoUrl,
      updateCollegeSettings,
      fetchCollegeSettings,
      loading
    }}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};
