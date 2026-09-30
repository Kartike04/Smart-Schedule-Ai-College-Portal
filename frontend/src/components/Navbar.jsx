import React, { useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { Calendar, UserCheck, LogOut, ChevronDown, Building2, Camera } from 'lucide-react';

const Navbar = ({ currentDept, onDeptChange }) => {
  const { user, logout } = useContext(AuthContext);
  const { collegeCode, logoUrl, updateCollegeSettings } = useCollege();
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

  return (
    <header className="top-navbar no-print">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', fontWeight: 800, fontSize: '1.2rem' }}>
          <div
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Click to change logo (Updates everywhere live)"
            style={{ position: 'relative', cursor: 'pointer', background: '#ffffff', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={logoUrl}
              alt="College Logo"
              onError={(e) => { e.target.src = '/logo.png'; }}
              style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '50%' }}
            />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#2563eb', color: '#ffffff', borderRadius: '50%', padding: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={9} />
            </div>
          </div>
          <span>{collegeCode} - Smart Schedule AI</span>
        </div>

        {/* Top Department Switcher */}
        <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <Building2 size={16} style={{ color: '#475569' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Dept:</span>
          <select
            value={currentDept}
            onChange={(e) => onDeptChange && onDeptChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="B.Sc. IT">B.Sc. IT</option>
            <option value="B.Sc. CS">B.Sc. CS</option>
            <option value="B.Sc. DS">B.Sc. DS</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{user.name}</div>
              <span style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: user.role === 'ADMIN' ? '#dbeafe' : '#dcfce7',
                color: user.role === 'ADMIN' ? '#1e40af' : '#15803d'
              }}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
