import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { ShieldCheck, UserCheck, KeyRound, Mail, ArrowRight, Camera } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@tsdc.edu.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { collegeName, collegeCode, logoUrl, updateCollegeSettings } = useCollege();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      updateCollegeSettings({ newLogo: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/faculty-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        padding: '36px 32px'
      }}>
        {/* Header with Dynamic College Logo (Interactive Change) */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Click to change logo (Updates everywhere live)"
            style={{
              position: 'relative',
              display: 'inline-block',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              border: '2px dashed #93c5fd',
              marginBottom: '12px',
              background: '#ffffff'
            }}
          >
            <img
              src={logoUrl}
              alt="College Logo"
              onError={(e) => { e.target.src = '/logo.png'; }}
              style={{ height: '85px', width: '85px', objectFit: 'contain', borderRadius: '50%' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '50%',
              padding: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={14} />
            </div>
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e3a8a' }}>
            {collegeCode} - Smart Schedule AI
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {collegeName} Timetable Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@tsdc.edu.in"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)'
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quick Demo Login Accounts:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setQuickLogin('admin@tsdc.edu.in', 'admin123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 600, fontSize: '0.825rem' }}>
                <ShieldCheck size={16} />
                <span>Admin Login</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>admin@tsdc.edu.in</span>
            </button>

            <button
              onClick={() => setQuickLogin('jasar.shaikh@tsdc.edu.in', 'faculty123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 600, fontSize: '0.825rem' }}>
                <UserCheck size={16} />
                <span>Faculty Login (JS - Jasar Shaikh)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Class In-Charge</span>
            </button>

            <button
              onClick={() => setQuickLogin('aman.singh@tsdc.edu.in', 'faculty123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 600, fontSize: '0.825rem' }}>
                <UserCheck size={16} />
                <span>Faculty Login (ARS - Aman Singh)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>DNET Faculty</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
