import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { UserX, Calendar, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Mail, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AbsenceManagement = () => {
  const [department, setDepartment] = useState('B.Sc. IT');
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Personal Leave');

  const [absenceResult, setAbsenceResult] = useState(null);
  const [absenceHistory, setAbsenceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchFacultyList();
    fetchAbsenceHistory();
  }, [department]);

  const fetchFacultyList = async () => {
    try {
      const res = await API.get(`/faculty?department=${department}`);
      setFacultyList(res.data);
      if (res.data.length > 0) {
        setSelectedFacultyId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAbsenceHistory = async () => {
    try {
      const res = await API.get(`/absence?department=${department}`);
      setAbsenceHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportAbsence = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAbsenceResult(null);
    try {
      const res = await API.post('/absence', {
        department,
        facultyId: selectedFacultyId,
        date,
        reason
      });
      setAbsenceResult(res.data);
      fetchAbsenceHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report absence');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSubstitute = (lecture) => {
    navigate('/smart-substitute', {
      state: {
        absenceId: absenceResult?.absence?._id,
        department,
        date,
        day: absenceResult?.dayName,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        subject: lecture.subject,
        originalFacultyId: selectedFacultyId,
        originalFacultyName: lecture.facultyName,
        originalFacultyAbbr: lecture.facultyAbbr,
        class: lecture.class,
        division: lecture.division,
        room: lecture.room
      }
    });
  };

  const handleViewUpdatedTimetable = () => {
    navigate('/timetable', { state: { selectedDate: date } });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
          Smart Absence & Auto-Substitute Engine
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Mark advance or current absence. AI automatically assigns available faculty with low workload, updates timetable & emails substitute details.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Report Form */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#e11d48', fontWeight: 700, fontSize: '1.1rem' }}>
            <UserX size={22} />
            <span>Mark Faculty Absence (Advance or Today)</span>
          </div>

          <form onSubmit={handleReportAbsence}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Select Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}
              >
                <option value="B.Sc. IT">B.Sc. IT</option>
                <option value="B.Sc. CS">B.Sc. CS</option>
                <option value="B.Sc. DS">B.Sc. DS</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Select Faculty Member</label>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}
              >
                {facultyList.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.abbreviation}) — {fac.employeeId}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Absence Date (Current or Advance)</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Reason for Absence</label>
              <input
                type="text"
                placeholder="e.g. Sick Leave / Personal Work / Official Duty"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} />
              <span>{loading ? 'Processing & Auto-Assigning AI Substitutes...' : 'Mark Absent & Auto-Assign AI Substitutes'}</span>
            </button>
          </form>
        </div>

        {/* Affected Lectures & Auto-Substitutions Result */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontWeight: 700, fontSize: '1.1rem' }}>
              <AlertTriangle size={22} style={{ color: '#d97706' }} />
              <span>Affected Lectures ({absenceResult ? absenceResult.dayName : 'Select Faculty'})</span>
            </div>

            {absenceResult && (
              <button
                onClick={handleViewUpdatedTimetable}
                style={{
                  padding: '6px 12px',
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View Updated Timetable</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {!absenceResult ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px border #cbd5e1' }}>
              Select a faculty member and click "Mark Absent" to evaluate affected lectures, auto-find substitutes, and generate the Updated Daily Timetable.
            </div>
          ) : absenceResult.affectedLecturesCount === 0 ? (
            <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontWeight: 600 }}>
              ✓ No lectures found on {absenceResult.dayName} for this faculty member. No substitution required.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                ✓ Recorded absence for <strong>{absenceResult.absence?.facultyName}</strong> on {date} ({absenceResult.dayName}). Original timetable is kept intact, and daily updated timetable is generated!
              </div>

              {absenceResult.affectedLectures.map((lec, idx) => (
                <div key={idx} style={{
                  padding: '14px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.95rem' }}>
                      {lec.startTime} – {lec.endTime} ({lec.day})
                    </div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                      Subject: {lec.subject} {lec.batch && `(Batch ${lec.batch})`}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                      Class: {lec.class} Div {lec.division} • Room: {lec.room}
                    </div>

                    {lec.substituteAssigned && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '0.8rem' }}>
                        <CheckCircle2 size={16} />
                        <span>Auto-Assigned Substitute: {lec.substituteAssigned.substituteFacultyName} ({lec.substituteAssigned.substituteFacultyAbbr}) — Match {lec.substituteAssigned.matchScore}%</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleGoToSubstitute(lec)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{lec.substituteAssigned ? 'Re-Evaluate AI' : 'Find Substitute'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reported Absences Table */}
      <div style={{ marginTop: '28px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '16px' }}>
          Absence History & Timetable Updates ({department})
        </h3>
        <table className="tt-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Faculty Name</th>
              <th>Abbreviation</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Timetable & Email Status</th>
            </tr>
          </thead>
          <tbody>
            {absenceHistory.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  No reported absences recorded.
                </td>
              </tr>
            ) : (
              absenceHistory.map((abs) => (
                <tr key={abs._id}>
                  <td style={{ textAlign: 'left', fontWeight: 700 }}>{abs.facultyName}</td>
                  <td>
                    <span style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      {abs.facultyAbbr}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{abs.date}</td>
                  <td style={{ textAlign: 'left', color: '#475569' }}>{abs.reason}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: abs.status === 'Substituted' ? '#dcfce7' : '#fee2e2',
                      color: abs.status === 'Substituted' ? '#15803d' : '#b91c1c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Mail size={12} />
                      {abs.status === 'Substituted' ? 'Substituted & Email Sent' : abs.status}
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

export default AbsenceManagement;
