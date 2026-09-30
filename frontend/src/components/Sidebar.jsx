import React, { useContext, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  BookOpen,
  UserX,
  Sparkles,
  RefreshCw,
  Clock,
  FileSpreadsheet,
  FileText,
  User,
  LogOut,
  Camera
} from 'lucide-react';

const Sidebar = () => {
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

  const adminNavs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Faculty', path: '/faculty', icon: Users },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Mark Absence', path: '/absence', icon: UserX },
    { name: 'Smart Substitute', path: '/smart-substitute', icon: Sparkles },
    { name: 'Substitutions', path: '/substitutions', icon: RefreshCw },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Excel Import', path: '/excel-import', icon: FileSpreadsheet },
    { name: 'Reports', path: '/reports', icon: FileText }
  ];

  const facultyNavs = [
    { name: 'Faculty Dashboard', path: '/faculty-dashboard', icon: LayoutDashboard },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'My Attendance', path: '/attendance', icon: Clock },
    { name: 'Substitutions', path: '/substitutions', icon: RefreshCw }
  ];

  const navs = user?.role === 'ADMIN' ? adminNavs : facultyNavs;

  return (
    <aside className="sidebar-container no-print">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div style={{ padding: '18px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          title="Click to change logo (Updates everywhere live)"
          style={{ position: 'relative', cursor: 'pointer', background: '#ffffff', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img
            src={logoUrl}
            alt="College Logo"
            onError={(e) => { e.target.src = '/logo.png'; }}
            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '50%' }}
          />
          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#2563eb', color: '#ffffff', borderRadius: '50%', padding: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={10} />
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '0.5px' }}>{collegeCode} Portal</div>
          <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Smart Schedule AI</div>
        </div>
      </div>

      <nav style={{ padding: '16px 8px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navs.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#2563eb' : 'transparent'
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '6px',
            border: 'none',
            background: '#334155',
            color: '#f8fafc',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
