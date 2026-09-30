import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { RefreshCw, Calendar, Building2, UserCheck, Mail } from 'lucide-react';

const SubstitutionsList = () => {
  const [substitutions, setSubstitutions] = useState([]);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubstitutions();
  }, [department]);

  const fetchSubstitutions = async () => {
    try {
      const res = await API.get(`/substitute?department=${department}`);
      setSubstitutions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
            Substitute Allocations & Email Records
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            History of smart substitute allocations, original faculty, match scores, and automated email notifications
          </p>
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
          >
            <option value="">All Departments</option>
            <option value="B.Sc. IT">B.Sc. IT</option>
            <option value="B.Sc. CS">B.Sc. CS</option>
            <option value="B.Sc. DS">B.Sc. DS</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="tt-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Date & Day</th>
              <th>Time Slot</th>
              <th>Dept / Class</th>
              <th>Subject</th>
              <th>Original Faculty</th>
              <th>Substitute Assigned</th>
              <th>Match Score</th>
              <th>Email Notification</th>
            </tr>
          </thead>
          <tbody>
            {substitutions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  No substitute assignments recorded.
                </td>
              </tr>
            ) : (
              substitutions.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 600 }}>{sub.date} ({sub.day})</td>
                  <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{sub.startTime} – {sub.endTime}</td>
                  <td>{sub.department} ({sub.class})</td>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>{sub.subject}</td>
                  <td style={{ color: '#e11d48', fontWeight: 600 }}>
                    {sub.originalFacultyName} ({sub.originalFacultyAbbr})
                  </td>
                  <td style={{ color: '#15803d', fontWeight: 700 }}>
                    {sub.substituteFacultyName} ({sub.substituteFacultyAbbr})
                  </td>
                  <td>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', fontSize: '0.775rem' }}>
                      {sub.matchScore}%
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Mail size={12} />
                      Sent & Timetable Updated
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubstitutionsList;
