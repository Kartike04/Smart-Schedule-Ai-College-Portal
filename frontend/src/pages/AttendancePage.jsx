import React, { useState, useEffect, useContext } from 'react';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Clock, CheckCircle2, Calendar, Filter } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [department, setDepartment] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [department, dateFilter]);

  const fetchAttendance = async () => {
    try {
      const res = await API.get(`/attendance?department=${department}&date=${dateFilter}`);
      setAttendanceRecords(res.data);
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
            Faculty Attendance Log
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Department-wise and faculty-wise attendance verification records
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '12px' }}>
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

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            />
          </div>
        )}
      </div>

      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="tt-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Faculty Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Time Recorded</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              attendanceRecords.map((att) => (
                <tr key={att._id}>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>
                    {att.facultyName}
                  </td>
                  <td style={{ fontWeight: 600 }}>{att.department}</td>
                  <td style={{ fontWeight: 600 }}>{att.date}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{att.time}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: att.status === 'Present' ? '#dcfce7' : '#fee2e2',
                      color: att.status === 'Present' ? '#15803d' : '#b91c1c'
                    }}>
                      ✓ {att.status}
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

export default AttendancePage;
