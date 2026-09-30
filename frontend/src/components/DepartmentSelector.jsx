import React from 'react';
import { Filter } from 'lucide-react';

const DepartmentSelector = ({
  department,
  setDepartment,
  academicYear,
  setAcademicYear,
  className,
  setClassName,
  division,
  setDivision,
  room,
  setRoom
}) => {
  return (
    <div style={{
      background: '#ffffff',
      padding: '16px 20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 700, fontSize: '0.9rem' }}>
        <Filter size={18} />
        <span>Timetable Filter:</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Department:</label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}
        >
          <option value="B.Sc. IT">B.Sc. IT</option>
          <option value="B.Sc. CS">B.Sc. CS</option>
          <option value="B.Sc. DS">B.Sc. DS</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Academic Year:</label>
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}
        >
          <option value="2026-27">2026-27</option>
          <option value="2025-26">2025-26</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Class:</label>
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}
        >
          {department === 'B.Sc. IT' && <option value="T.Y. B.Sc. (IT)">T.Y. B.Sc. (IT)</option>}
          {department === 'B.Sc. IT' && <option value="S.Y. B.Sc. (IT)">S.Y. B.Sc. (IT)</option>}
          {department === 'B.Sc. IT' && <option value="F.Y. B.Sc. (IT)">F.Y. B.Sc. (IT)</option>}
          {department === 'B.Sc. CS' && <option value="T.Y. B.Sc. (CS)">T.Y. B.Sc. (CS)</option>}
          {department === 'B.Sc. DS' && <option value="T.Y. B.Sc. (DS)">T.Y. B.Sc. (DS)</option>}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Division:</label>
        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}
        >
          <option value="C">C</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </div>

      {room && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Room:</label>
          <span style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
            {room}
          </span>
        </div>
      )}
    </div>
  );
};

export default DepartmentSelector;
