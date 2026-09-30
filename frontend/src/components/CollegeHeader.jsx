import React, { useState, useRef } from 'react';
import { Camera, Edit3, Check, X } from 'lucide-react';
import { useCollege } from '../context/CollegeContext';

const CollegeHeader = ({ selectedDate, departmentName }) => {
  const { collegeName, collegeCode, logoUrl, updateCollegeSettings } = useCollege();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameVal, setEditNameVal] = useState('');
  const [editCodeVal, setEditCodeVal] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleSaveSettings = async (newName, newCode, newLogo) => {
    setSaving(true);
    try {
      await updateCollegeSettings({
        newName: newName !== undefined ? newName : collegeName,
        newCode: newCode !== undefined ? newCode : collegeCode,
        newLogo: newLogo !== undefined ? newLogo : logoUrl
      });
      setIsEditingName(false);
    } catch (err) {
      alert('Failed to save college header changes: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      handleSaveSettings(collegeName, collegeCode, base64Image);
    };
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    setEditNameVal(collegeName);
    setEditCodeVal(collegeCode);
    setIsEditingName(true);
  };

  return (
    <div className="college-header-box" style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '16px 20px',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      marginBottom: '16px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
    }}>
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Profile-Picture Style Logo Container with Camera Badge */}
      <div
        className="logo-avatar-wrapper"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        title="Click to change College Logo (Profile Picture Style)"
        style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          border: '2px dashed #93c5fd',
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={logoUrl}
          alt="College Logo"
          onError={(e) => { e.target.src = '/logo.png'; }}
          style={{
            height: '75px',
            width: '75px',
            objectFit: 'contain',
            borderRadius: '50%'
          }}
        />

        {/* Hover Camera Icon Overlay */}
        <div
          className="camera-overlay"
          style={{
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
          }}
        >
          <Camera size={14} />
        </div>
      </div>

      {/* College Name & Tagline Area */}
      <div style={{ textAlign: 'left', flex: isEditingName ? 1 : 'none', maxWidth: '650px' }}>
        {isEditingName ? (
          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '2px solid #2563eb', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', marginBottom: '6px', textTransform: 'uppercase' }}>
              Edit College Header Details (Updates Everywhere Live)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>Tagline Code</label>
                <input
                  type="text"
                  value={editCodeVal}
                  onChange={(e) => setEditCodeVal(e.target.value)}
                  placeholder="TSDC"
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>College Full Name</label>
                <input
                  type="text"
                  value={editNameVal}
                  onChange={(e) => setEditNameVal(e.target.value)}
                  placeholder="Thakur Shyamnarayan Degree College"
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <X size={14} inline /> Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings(editNameVal, editCodeVal)}
                disabled={saving}
                style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Check size={14} inline /> {saving ? 'Saving...' : 'Save Everywhere'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {collegeCode}
              </span>

              {/* Edit Header Icon Button */}
              <button
                onClick={startEditing}
                className="no-print"
                title="Edit College Name & Header"
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit3 size={12} />
                <span>Edit Name</span>
              </button>
            </div>

            <h2
              className="college-title"
              onClick={startEditing}
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '2px 0 4px 0',
                cursor: 'pointer',
                letterSpacing: '-0.01em'
              }}
              title="Click to edit College Name"
            >
              {collegeName}
            </h2>

            <div className="college-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
              {selectedDate ? `Updated Daily Timetable (${selectedDate})` : `${departmentName || 'Master'} Master Timetable`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeHeader;
