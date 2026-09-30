import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { Clock, Calendar, CheckCircle2, User, RefreshCw, AlertCircle, UserX, Sparkles, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const faculty = user?.faculty;
  const navigate = useNavigate();

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [workloadInfo, setWorkloadInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Advance Absence Form
  const [advanceDate, setAdvanceDate] = useState('');
  const [advanceReason, setAdvanceReason] = useState('Personal Work');
  const [advanceSubmitting, setAdvanceSubmitting] = useState(false);
  const [advanceMsg, setAdvanceMsg] = useState('');

  const [attendanceMsg, setAttendanceMsg] = useState('');
  const [attendanceError, setAttendanceError] = useState('');

  const todayDateStr = new Date().toISOString().split('T')[0];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    fetchFacultyData();
  }, [user]);

  const fetchFacultyData = async () => {
    try {
      if (!user) return;
      const dept = faculty?.department || 'B.Sc. IT';
      const fId = faculty?._id || '';

      const [ttRes, subRes, attRes, wlRes] = await Promise.all([
        API.get(`/timetable?department=${dept}`),
        API.get(`/substitute?facultyId=${fId}`),
        API.get(`/attendance?date=${todayDateStr}`),
        API.get(`/substitute/workload?department=${dept}&date=${todayDateStr}`)
      ]);

      // Extract today's slots for this faculty
      const slots = ttRes.data?.slots || [];
      const fAbbr = faculty?.abbreviation || '';

      const myTodaySlots = [];
      for (const slot of slots) {
        if (slot.day === currentDay && !slot.isBreak) {
          let isAssigned = false;
          let subj = slot.subject;
          let room = slot.room || ttRes.data?.roomNo || '620';

          if ((slot.facultyId && slot.facultyId.toString() === fId) || slot.facultyAbbr === fAbbr) {
            isAssigned = true;
          } else if (slot.batchDetails && slot.batchDetails.length > 0) {
            for (const b of slot.batchDetails) {
              if ((b.facultyId && b.facultyId.toString() === fId) || b.facultyAbbr === fAbbr) {
                isAssigned = true;
                subj = `${b.batch} – ${b.subject}`;
                room = b.lab || room;
                break;
              }
            }
          }

          if (isAssigned) {
            myTodaySlots.push({
              time: `${slot.startTime} – ${slot.endTime}`,
              subject: subj,
              room: room,
              status: 'Scheduled'
            });
          }
        }
      }

      setTodaySchedule(myTodaySlots);
      setSubstitutions(subRes.data || []);

      const myAtt = (attRes.data || []).find(a => a.facultyId === fId);
      if (myAtt) {
        setAttendance(myAtt);
      }

      const myWl = (wlRes.data?.workloadReport || []).find(w => w.facultyId === fId);
      setWorkloadInfo(myWl || null);

    } catch (error) {
      console.error('Error fetching faculty dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    setAttendanceMsg('');
    setAttendanceError('');
    try {
      const res = await API.post('/attendance/mark', {
        date: todayDateStr,
        status: 'Present'
      });
      setAttendance(res.data.attendance);
      setAttendanceMsg(res.data.message || 'Attendance marked successfully!');
    } catch (err) {
      setAttendanceError(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleMarkAdvanceAbsence = async (e) => {
    e.preventDefault();
    if (!advanceDate) return;
    setAdvanceSubmitting(true);
    setAdvanceMsg('');

    try {
      const res = await API.post('/absence', {
        department: faculty?.department || 'B.Sc. IT',
        facultyId: faculty?._id,
        date: advanceDate,
        reason: advanceReason
      });

      setAdvanceMsg(res.data.message || `Advance leave marked for ${advanceDate}. AI substitutes allocated!`);
      setAdvanceDate('');
      fetchFacultyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit advance leave');
    } finally {
      setAdvanceSubmitting(false);
    }
  };

  const totalLecturesToday = (workloadInfo?.totalWorkload !== undefined)
    ? workloadInfo.totalWorkload
    : todaySchedule.length;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '28px 24px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)'
      }}>
        <div>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            TSDC FACULTY PORTAL
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
            Welcome, {user?.name || 'Faculty Member'}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '2px' }}>
            Department of {faculty?.department || 'B.Sc. IT'} • Employee ID: {faculty?.employeeId || 'TSDC-IT-001'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={markAttendance}
            disabled={!!attendance}
            style={{
              padding: '12px 20px',
              backgroundColor: attendance ? '#16a34a' : '#ffffff',
              color: attendance ? '#ffffff' : '#1e40af',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: attendance ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{attendance ? `Attendance Marked (${attendance.time})` : "Mark Today's Attendance"}</span>
          </button>
        </div>
      </div>

      {attendanceMsg && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, border: '1px solid #86efac' }}>
          ✓ {attendanceMsg}
        </div>
      )}

      {attendanceError && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, border: '1px solid #fca5a5' }}>
          ⚠ {attendanceError}
        </div>
      )}

      {/* Smart Workload Status Bar */}
      <div style={{
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: totalLecturesToday > 4 ? '#fef3c7' : '#dbeafe',
            color: totalLecturesToday > 4 ? '#b45309' : '#1e40af',
            padding: '14px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              MY DAILY LECTURE WORKLOAD
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              {totalLecturesToday} / 4 Lectures Scheduled Today
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
              Target Max: 4 lectures/day • Status: <strong style={{ color: totalLecturesToday > 4 ? '#d97706' : '#16a34a' }}>
                {totalLecturesToday > 4 ? '⚠ Above Target Limit' : (totalLecturesToday === 4 ? '✓ At Capacity' : '✓ Optimal Workload')}
              </strong>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
            <span>Workload Capacity</span>
            <span>{Math.min(100, Math.round((totalLecturesToday / 4) * 100))}%</span>
          </div>
          <div style={{ width: '100%', background: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (totalLecturesToday / 4) * 100)}%`,
              height: '100%',
              background: totalLecturesToday > 4 ? '#d97706' : '#2563eb',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Advance Leave & Today's Schedule Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

        {/* Mark Advance Absence Form */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#e11d48', fontWeight: 700, fontSize: '1.05rem' }}>
            <UserX size={20} />
            <span>Mark Advance Absence / Leave</span>
          </div>

          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
            Plan leave in advance. AI will automatically find substitute faculty with lower workload, update the daily timetable, and email the substitute.
          </p>

          {advanceMsg && (
            <div style={{ padding: '10px 14px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #86efac' }}>
              ✓ {advanceMsg}
            </div>
          )}

          <form onSubmit={handleMarkAdvanceAbsence}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Absence Date</label>
              <input
                type="date"
                required
                value={advanceDate}
                min={todayDateStr}
                onChange={(e) => setAdvanceDate(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Reason</label>
              <input
                type="text"
                required
                placeholder="e.g. Personal Work / Medical Leave / Duty Leave"
                value={advanceReason}
                onChange={(e) => setAdvanceReason(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
              />
            </div>

            <button
              type="submit"
              disabled={advanceSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: advanceSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={16} />
              <span>{advanceSubmitting ? 'Processing AI Auto-Substitute...' : 'Submit Advance Absence'}</span>
            </button>
          </form>
        </div>

        {/* Today's Timetable */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1e3a8a', fontWeight: 700, fontSize: '1.05rem' }}>
            <Calendar size={20} />
            <span>Today's Regular Timetable ({currentDay})</span>
          </div>

          {todaySchedule.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No scheduled lectures assigned for today ({currentDay}).
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todaySchedule.map((slot, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: '4px solid #2563eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                      {slot.time}
                    </div>
                    <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
                      {slot.subject}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                      Room / Location: <strong>{slot.room}</strong>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: '#dbeafe',
                    color: '#1e40af'
                  }}>
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Assigned Substitutions */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#d97706', fontWeight: 700, fontSize: '1.05rem' }}>
            <RefreshCw size={20} />
            <span>Substitutions Assigned to Me</span>
          </div>

          {substitutions.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
              <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
                No substitute lectures assigned to you currently.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {substitutions.map((sub) => (
                <div key={sub._id} style={{
                  padding: '12px 16px',
                  background: '#fffbeb',
                  borderRadius: '8px',
                  borderLeft: '4px solid #d97706',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#78350f', fontSize: '0.9rem' }}>
                      {sub.date} ({sub.day}) • {sub.startTime} – {sub.endTime}
                    </div>
                    <div style={{ color: '#b45309', fontWeight: 600, fontSize: '0.85rem' }}>
                      {sub.subject} ({sub.class} Div {sub.division})
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#92400e' }}>
                      Substituting for: {sub.originalFacultyName} ({sub.originalFacultyAbbr}) • Room {sub.room}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: '#fef3c7',
                      color: '#92400e',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Mail size={12} />
                      Email Notified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
