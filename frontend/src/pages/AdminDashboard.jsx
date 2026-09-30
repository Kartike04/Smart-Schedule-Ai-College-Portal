import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import {
  Users,
  Building2,
  Calendar,
  UserX,
  RefreshCw,
  Upload,
  UserPlus,
  Sparkles,
  Clock,
  Eye,
  ArrowUpRight
} from 'lucide-react';

import { useCollege } from '../context/CollegeContext';

const AdminDashboard = () => {
  const { collegeName } = useCollege();
  const [stats, setStats] = useState({
    totalFaculties: 6,
    totalDepartments: 3,
    todaysLectures: 6,
    absentFaculties: 0,
    todaysSubstitutions: 0
  });

  const [absences, setAbsences] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [facRes, deptRes, absRes, subRes] = await Promise.all([
        API.get('/faculty'),
        API.get('/departments'),
        API.get('/absence'),
        API.get('/substitute')
      ]);

      setStats({
        totalFaculties: facRes.data.length || 6,
        totalDepartments: deptRes.data.length || 3,
        todaysLectures: 6,
        absentFaculties: absRes.data.length || 0,
        todaysSubstitutions: subRes.data.length || 0
      });

      setAbsences(absRes.data);
      setSubstitutions(subRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Faculties', value: stats.totalFaculties, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { title: 'Total Departments', value: stats.totalDepartments, icon: Building2, color: '#7c3aed', bg: '#f5f3ff' },
    { title: "Today's Lectures", value: stats.todaysLectures, icon: Calendar, color: '#059669', bg: '#ecfdf5' },
    { title: 'Absent Faculties', value: stats.absentFaculties, icon: UserX, color: '#e11d48', bg: '#fff1f2' },
    { title: "Today's Substitutions", value: stats.todaysSubstitutions, icon: RefreshCw, color: '#d97706', bg: '#fffbeb' }
  ];

  const quickButtons = [
    { label: 'Upload Timetable', icon: Upload, path: '/excel-import', color: '#1e40af' },
    { label: 'Add Faculty', icon: UserPlus, path: '/faculty', color: '#2563eb' },
    { label: 'Manage Departments', icon: Building2, path: '/departments', color: '#7c3aed' },
    { label: 'Mark Absence', icon: UserX, path: '/absence', color: '#e11d48' },
    { label: 'Find Substitute', icon: Sparkles, path: '/smart-substitute', color: '#d97706' },
    { label: 'View Timetable', icon: Eye, path: '/timetable', color: '#059669' },
    { label: 'View Attendance', icon: Clock, path: '/attendance', color: '#0284c7' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {collegeName} — Smart Schedule AI Management Overview
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {card.value}
                </div>
              </div>
              <div style={{
                background: card.bg,
                color: card.color,
                padding: '12px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '28px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
          Quick Admin Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}>
          {quickButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(btn.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#1e293b',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} style={{ color: btn.color }} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Absences & Substitutions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Absences Card */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Recent Faculty Absences</h3>
            <button
              onClick={() => navigate('/absence')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Manage Absences</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {absences.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic', padding: '12px 0' }}>
              No faculty absences reported today. All faculty active.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {absences.slice(0, 5).map((abs) => (
                <div key={abs._id} style={{ padding: '10px 12px', background: '#fff1f2', borderRadius: '6px', border: '1px solid #fecdd3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>{abs.facultyName} ({abs.facultyAbbr})</div>
                    <div style={{ fontSize: '0.775rem', color: '#be123c' }}>{abs.department} • Date: {abs.date}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: abs.status === 'Substituted' ? '#dcfce7' : '#fee2e2', color: abs.status === 'Substituted' ? '#15803d' : '#b91c1c' }}>
                    {abs.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Substitutions Card */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Active Substitutions</h3>
            <button
              onClick={() => navigate('/substitutions')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {substitutions.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic', padding: '12px 0' }}>
              No substitutions assigned yet today.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {substitutions.slice(0, 5).map((sub) => (
                <div key={sub._id} style={{ padding: '10px 12px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.875rem' }}>
                      {sub.subject} ({sub.day} {sub.startTime})
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#047857' }}>
                      Orig: {sub.originalFacultyAbbr} → <strong>Sub: {sub.substituteFacultyName} ({sub.substituteFacultyAbbr})</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#d1fae5', color: '#065f46' }}>
                    Match: {sub.matchScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
