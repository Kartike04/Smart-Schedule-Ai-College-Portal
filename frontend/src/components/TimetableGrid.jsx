import React from 'react';
import FacultyLegend from './FacultyLegend';
import { Building2, Calendar, UserCheck, MapPin, Tag, Mail, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

import CollegeHeader from './CollegeHeader';

const defaultTimeHeaders = [
  { label: '08:00 AM – 09:00 AM', startTime: '08:00 AM', endTime: '09:00 AM' },
  { label: '09:00 AM – 10:00 AM', startTime: '09:00 AM', endTime: '10:00 AM' },
  { label: '10:00 AM – 10:15 AM', startTime: '10:00 AM', endTime: '10:15 AM', isBreak: true, title: 'SHORT BREAK' },
  { label: '10:15 AM – 11:15 AM', startTime: '10:15 AM', endTime: '11:15 AM' },
  { label: '11:15 AM – 12:15 PM', startTime: '11:15 AM', endTime: '12:15 PM' },
  { label: '12:15 PM – 12:45 PM', startTime: '12:15 PM', endTime: '12:45 PM', isBreak: true, title: 'LUNCH BREAK' },
  { label: '12:45 PM – 01:45 PM', startTime: '12:45 PM', endTime: '01:45 PM' },
  { label: '01:45 PM – 02:45 PM', startTime: '01:45 PM', endTime: '02:45 PM' }
];

const TimetableGrid = ({ timetableData, substitutions = [], department = 'B.Sc. IT', selectedDate = null, workloadSummary = [] }) => {
  if (!timetableData) {
    return (
      <div className="timetable-paper" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 600 }}>
          No timetable has been uploaded for this department.
        </div>
        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem' }}>
          Please contact Admin or upload an Excel timetable file to configure {department}.
        </p>
      </div>
    );
  }

  // Dynamic time header generation from timetableData.slots
  const getTimeHeaders = () => {
    if (!timetableData.slots || timetableData.slots.length === 0) {
      return defaultTimeHeaders;
    }

    const map = new Map();
    timetableData.slots.forEach((s) => {
      if (!s.startTime || !s.endTime) return;
      const key = `${s.startTime.trim()}-${s.endTime.trim()}`;
      if (!map.has(key)) {
        map.set(key, {
          label: `${s.startTime.trim()} – ${s.endTime.trim()}`,
          startTime: s.startTime.trim(),
          endTime: s.endTime.trim(),
          isBreak: s.isBreak,
          title: s.breakTitle || (s.isBreak ? 'BREAK' : '')
        });
      }
    });

    if (map.size < 4) {
      defaultTimeHeaders.forEach(dth => {
        const k = `${dth.startTime.trim()}-${dth.endTime.trim()}`;
        if (!map.has(k)) {
          map.set(k, dth);
        }
      });
    }

    const headers = Array.from(map.values());
    
    // Sort headers chronologically
    const parseTime = (tStr) => {
      if (!tStr) return 0;
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let [_, h, m, p] = match;
      let hrs = parseInt(h, 10);
      if (p && p.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
      if (p && p.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + parseInt(m, 10);
    };

    headers.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
    return headers;
  };

  const timeHeaders = getTimeHeaders();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const normTime = (t) => {
    if (!t) return '';
    return t.toString().replace(/^0/, '').replace(/\s+/g, '').toLowerCase();
  };

  // Helper to find slot matching day and startTime
  const getSlot = (dayName, startTime) => {
    if (!timetableData.slots) return null;
    const targetNorm = normTime(startTime);
    return timetableData.slots.find(
      (s) => s.day === dayName && (s.startTime.trim() === startTime.trim() || normTime(s.startTime) === targetNorm)
    );
  };

  // Helper to check for active substitution
  const getSubForSlot = (dayName, startTime) => {
    if (!substitutions || substitutions.length === 0) return null;
    const targetNorm = normTime(startTime);
    return substitutions.find(
      (sub) => sub.day === dayName && (sub.startTime.trim() === startTime.trim() || normTime(sub.startTime) === targetNorm)
    );
  };

  return (
    <div className="timetable-paper" id="printable-timetable">
      {/* College Header (Profile Logo Change & Editable College Name) */}
      <CollegeHeader selectedDate={selectedDate} departmentName={timetableData.department || department} />

      {/* Mode Indicator Banner */}
      {selectedDate ? (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Sparkles size={18} />
            <span>UPDATED DAILY TIMETABLE (Substitutions & Email Notifications Active) — {selectedDate}</span>
          </div>
          <span style={{ fontSize: '0.75rem', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px' }}>
            Original Timetable Intact
          </span>
        </div>
      ) : (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#475569',
          padding: '8px 14px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle2 size={16} style={{ color: '#2563eb' }} />
          <span>Showing Master Timetable for {timetableData.department || department}. Select a date above to view the Daily Timetable.</span>
        </div>
      )}

      {/* Daily Workload Summary Bar */}
      {selectedDate && workloadSummary.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Faculty Daily Workload Balance ({selectedDate}) • Max Target: 4 Lectures/Day
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {workloadSummary.map((wl) => {
              const isOver = wl.totalWorkload > 4;
              const isCap = wl.totalWorkload === 4;
              const isAbsent = wl.isAbsent;

              return (
                <div key={wl.facultyId} style={{
                  background: isAbsent ? '#fee2e2' : (isOver ? '#fef3c7' : '#f0fdf4'),
                  border: isAbsent ? '1px solid #fca5a5' : (isOver ? '1px solid #fde68a' : '1px solid #bbf7d0'),
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <strong style={{ color: isAbsent ? '#b91c1c' : '#0f172a' }}>{wl.abbreviation}:</strong>
                  {isAbsent ? (
                    <span style={{ color: '#b91c1c', fontWeight: 700 }}>ABSENT</span>
                  ) : (
                    <span style={{ fontWeight: 700, color: isOver ? '#b45309' : (isCap ? '#15803d' : '#2563eb') }}>
                      {wl.totalWorkload} / 4 Lectures
                      {isOver && ' ⚠ (Over Cap)'}
                      {isCap && ' ✓ (At Cap)'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timetable Metadata Bar */}
      <div className="timetable-meta-grid">
        <div className="timetable-meta-item">
          <Calendar size={15} style={{ color: '#2563eb' }} />
          <span><strong>Academic Year:</strong> {timetableData.academicYear || '2026-27'}</span>
        </div>
        <div className="timetable-meta-item">
          <Building2 size={15} style={{ color: '#2563eb' }} />
          <span><strong>Class:</strong> {timetableData.class || 'T.Y. B.Sc. (IT)'}</span>
        </div>
        <div className="timetable-meta-item">
          <Tag size={15} style={{ color: '#2563eb' }} />
          <span><strong>Division:</strong> {timetableData.division || 'C'}</span>
        </div>
        <div className="timetable-meta-item">
          <MapPin size={15} style={{ color: '#2563eb' }} />
          <span><strong>Room No:</strong> {timetableData.roomNo || '620'}</span>
        </div>
        <div className="timetable-meta-item">
          <span><strong>Effective From:</strong> {timetableData.effectiveFrom || '01/07/2026'}</span>
        </div>
        <div className="timetable-meta-item">
          <UserCheck size={15} style={{ color: '#2563eb' }} />
          <span><strong>Class In-Charge:</strong> {timetableData.classInCharge || 'Department Admin'}</span>
        </div>
      </div>

      {/* Main Timetable Table Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table className="tt-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Day</th>
              {timeHeaders.map((th, idx) => (
                <th key={idx} style={{ minWidth: th.isBreak ? '75px' : '120px' }}>
                  {th.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              if (day === 'Saturday' && (!timetableData.slots || !timetableData.slots.some(s => s.day === 'Saturday' && s.subject))) {
                return (
                  <tr key={day}>
                    <td style={{ fontWeight: 700, background: '#f1f5f9' }}>{day}</td>
                    <td
                      colSpan={timeHeaders.length}
                      style={{
                        background: '#f8fafc',
                        fontStyle: 'italic',
                        color: '#475569',
                        padding: '16px',
                        fontWeight: 600
                      }}
                    >
                      Academic, Co-curricular & Extra-curricular Activities
                      <br />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        (Except 2nd and 4th Saturday)
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={day}>
                  <td style={{ fontWeight: 700, background: '#f1f5f9' }}>{day}</td>
                  {timeHeaders.map((th, idx) => {
                    if (th.isBreak) {
                      return (
                        <td key={idx} className="slot-break">
                          {th.title || 'BREAK'}
                        </td>
                      );
                    }

                    const slot = getSlot(day, th.startTime);
                    const sub = getSubForSlot(day, th.startTime);

                    if (!slot || (!slot.subject && (!slot.batchDetails || slot.batchDetails.length === 0) && !slot.note)) {
                      return <td key={idx} style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</td>;
                    }

                    if (slot.note && !slot.subject && (!slot.batchDetails || slot.batchDetails.length === 0)) {
                      return <td key={idx} style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{slot.note}</td>;
                    }

                    // Render Practical Batch Details (X / Y)
                    if (slot.batchDetails && slot.batchDetails.length > 0) {
                      return (
                        <td key={idx} style={{ padding: '4px' }}>
                          {slot.batchDetails.map((b, bIdx) => (
                            <div key={bIdx} className="slot-batch-box">
                              <div style={{ fontWeight: 700, color: '#1e3a8a' }}>
                                {b.batch} – {b.subject}
                              </div>
                              <div style={{ fontSize: '0.725rem', color: '#475569' }}>
                                {b.lab && <span>({b.lab}) </span>}
                                {sub ? (
                                  <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                    {b.facultyAbbr || b.facultyName}
                                  </span>
                                ) : (
                                  <strong>{b.facultyAbbr || b.facultyName}</strong>
                                )}
                              </div>
                            </div>
                          ))}
                          {sub && (
                            <div className="substitute-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                              <Mail size={12} />
                              <span>SUB: {sub.substituteFacultyAbbr}</span>
                            </div>
                          )}
                        </td>
                      );
                    }

                    // Render Regular Lecture
                    return (
                      <td key={idx} style={{ background: sub ? '#f0fdf4' : 'inherit' }}>
                        <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.85rem' }}>
                          {slot.subject}
                          {slot.room && slot.room !== timetableData.roomNo && (
                            <span style={{ fontSize: '0.725rem', color: '#2563eb', marginLeft: '4px' }}>
                              ({slot.room})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: '#475569', marginTop: '2px' }}>
                          {sub ? (
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                              {slot.facultyAbbr} ({slot.facultyName})
                            </span>
                          ) : (
                            <strong>{slot.facultyAbbr}</strong>
                          )}
                          {!sub && slot.facultyName && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{slot.facultyName}</div>
                          )}
                        </div>

                        {sub && (
                          <div className="substitute-badge" title={`Substitute assigned: ${sub.substituteFacultyName} (${sub.substituteFacultyAbbr}). Email notification sent.`} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <Mail size={12} />
                            <span>SUB: {sub.substituteFacultyAbbr}</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Faculty Legend */}
      <FacultyLegend department={department} />
    </div>
  );
};

export default TimetableGrid;
