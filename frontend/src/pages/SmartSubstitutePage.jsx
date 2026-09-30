import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Sparkles, Check, X, ShieldAlert, Award, ArrowRight, UserCheck, Mail, Clock, AlertTriangle } from 'lucide-react';

const SmartSubstitutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [slotData, setSlotData] = useState({
    absenceId: location.state?.absenceId || '',
    department: location.state?.department || 'B.Sc. IT',
    date: location.state?.date || new Date().toISOString().split('T')[0],
    day: location.state?.day || 'Tuesday',
    startTime: location.state?.startTime || '08:00 AM',
    endTime: location.state?.endTime || '09:00 AM',
    subject: location.state?.subject || 'DNET',
    originalFacultyId: location.state?.originalFacultyId || '',
    originalFacultyName: location.state?.originalFacultyName || 'Mr. Aman Singh',
    originalFacultyAbbr: location.state?.originalFacultyAbbr || 'ARS',
    class: location.state?.class || 'T.Y. B.Sc. (IT)',
    division: location.state?.division || 'C',
    room: location.state?.room || '620'
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, [slotData.department, slotData.date, slotData.startTime, slotData.subject]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await API.post('/substitute/recommend', {
        department: slotData.department,
        date: slotData.date,
        day: slotData.day,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        subject: slotData.subject,
        originalFacultyId: slotData.originalFacultyId
      });
      setCandidates(res.data.candidates || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to calculate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubstitute = async (candidate) => {
    if (!candidate.isAvailable) {
      alert('This faculty member is not available at this time slot (already teaching or absent)!');
      return;
    }

    if (candidate.workloadInfo?.totalWorkload >= 4) {
      const availableSubWithCapacity = candidates.find(c => c.isAvailable && c.workloadInfo?.totalWorkload < 4);
      if (availableSubWithCapacity) {
        const confirmOverload = window.confirm(
          `Notice: ${candidate.faculty.name} already has ${candidate.workloadInfo.totalWorkload} lectures today (Max target: 4).\n\nAnother suitable teacher (${availableSubWithCapacity.faculty.name}) is available with fewer lectures.\n\nDo you still want to assign ${candidate.faculty.name}?`
        );
        if (!confirmOverload) return;
      }
    }

    if (!window.confirm(`Confirm assigning ${candidate.faculty.name} (${candidate.faculty.abbreviation}) as substitute for ${slotData.subject}?\n\nAn automated email notification will be sent to ${candidate.faculty.email}.`)) {
      return;
    }

    setAssigning(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.post('/substitute/assign', {
        absenceId: slotData.absenceId || null,
        department: slotData.department,
        date: slotData.date,
        day: slotData.day,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        originalFacultyId: slotData.originalFacultyId || null,
        originalFacultyName: slotData.originalFacultyName,
        originalFacultyAbbr: slotData.originalFacultyAbbr,
        substituteFacultyId: candidate.faculty._id,
        substituteFacultyName: candidate.faculty.name,
        substituteFacultyAbbr: candidate.faculty.abbreviation,
        subject: slotData.subject,
        class: slotData.class,
        division: slotData.division,
        room: slotData.room,
        matchScore: candidate.matchScore,
        scoreBreakdown: candidate.breakdown
      });

      const emailNote = res.data.emailSent ? ' Email notification dispatched.' : '';
      setSuccessMsg(`Successfully assigned ${candidate.faculty.name} (${candidate.faculty.abbreviation}) as substitute! Live timetable has been updated.${emailNote}`);

      // Auto navigate to timetable after 2 seconds
      setTimeout(() => {
        navigate('/timetable', { state: { selectedDate: slotData.date } });
      }, 1800);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign substitute.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles style={{ color: '#d97706' }} />
          Smart Workload & Substitute Allocation Engine
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          AI Rule Engine: Availability (+40), Same Dept (+25), Subject/Skill Match (+20), Balanced Workload &lt; 4 lectures (+15). Excludes absent & busy faculty.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '16px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontWeight: 700, border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={20} />
          <span>✓ {successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontWeight: 700, border: '1px solid #fca5a5' }}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* Affected Lecture Banner */}
      <div style={{
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          AFFECTED LECTURE DETAILS
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '10px', fontSize: '0.95rem' }}>
          <div><strong>Department:</strong> {slotData.department}</div>
          <div><strong>Date:</strong> {slotData.date} ({slotData.day})</div>
          <div><strong>Time Slot:</strong> <span style={{ color: '#1e40af', fontWeight: 700 }}>{slotData.startTime} – {slotData.endTime}</span></div>
          <div><strong>Subject:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{slotData.subject}</span></div>
          <div><strong>Absent Teacher:</strong> <span style={{ color: '#e11d48', fontWeight: 700 }}>{slotData.originalFacultyName} ({slotData.originalFacultyAbbr})</span></div>
          <div><strong>Location:</strong> {slotData.class} Div {slotData.division} (Room {slotData.room})</div>
        </div>
      </div>

      {/* Candidate Recommendation Cards */}
      <div style={{ marginBottom: '16px', fontWeight: 800, color: '#1e293b', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Recommended Substitutes (Ranked by Availability & Workload):</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Target Workload: Max 4 Lectures/Day</span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Evaluating faculty availability and calculating workload scores...
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', textAlign: 'center' }}>
          No available faculty members found for this time slot.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
          {candidates.map((cand, idx) => {
            const wl = cand.workloadInfo || {};
            const isTop = idx === 0 && cand.isAvailable;
            const isOverloaded = wl.totalWorkload >= 4;

            return (
              <div key={cand.faculty._id} style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: isTop ? '2px solid #2563eb' : (!cand.isAvailable ? '1px dashed #cbd5e1' : '1px solid #e2e8f0'),
                opacity: !cand.isAvailable ? 0.75 : 1,
                padding: '24px',
                boxShadow: isTop ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 2px 4px rgba(0,0,0,0.03)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {isTop && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    letterSpacing: '0.5px'
                  }}>
                    ★ TOP AI RECOMMENDATION
                  </span>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        {cand.faculty.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Abbr: <strong>{cand.faculty.abbreviation}</strong> • {cand.faculty.department}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#475569', marginTop: '2px' }}>
                        Email: {cand.faculty.email}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: cand.isAvailable ? (cand.matchScore >= 80 ? '#2563eb' : '#d97706') : '#94a3b8'
                      }}>
                        {cand.matchScore}%
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>MATCH SCORE</div>
                    </div>
                  </div>

                  {/* Daily Workload Pill */}
                  <div style={{
                    background: isOverloaded ? '#fffbeb' : '#f0fdf4',
                    border: isOverloaded ? '1px solid #fde68a' : '1px solid #bbf7d0',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: isOverloaded ? '#b45309' : '#15803d' }}>
                      <Clock size={16} />
                      <span>Today's Workload: {wl.totalWorkload || 0} / 4 Lectures</span>
                    </div>

                    <span style={{ fontSize: '0.725rem', fontWeight: 800, color: isOverloaded ? '#d97706' : '#16a34a' }}>
                      {isOverloaded ? 'At Workload Cap' : 'Balanced'}
                    </span>
                  </div>

                  {/* Score Breakdown Pills */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: cand.breakdown.available > 0 ? '#15803d' : '#b91c1c' }}>
                      {cand.breakdown.available > 0 ? <Check size={16} /> : <X size={16} />}
                      <span>
                        Availability (+{cand.breakdown.available}/40)
                        {!cand.isAvailable && (cand.isAbsent ? ' — Absent / On Leave' : ' — Teaching at this time')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: cand.breakdown.sameDept > 0 ? '#15803d' : '#64748b' }}>
                      {cand.breakdown.sameDept > 0 ? <Check size={16} /> : <X size={16} />}
                      <span>Department Match (+{cand.breakdown.sameDept}/25)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: cand.breakdown.subjectSkillMatch > 0 ? '#15803d' : '#64748b' }}>
                      {cand.breakdown.subjectSkillMatch > 0 ? <Check size={16} /> : <X size={16} />}
                      <span>Subject / Skill Match (+{cand.breakdown.subjectSkillMatch}/20)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: cand.breakdown.lowWorkload > 0 ? '#15803d' : (cand.breakdown.lowWorkload < 0 ? '#b91c1c' : '#64748b') }}>
                      {cand.breakdown.lowWorkload > 0 ? <Check size={16} /> : <AlertTriangle size={16} />}
                      <span>
                        Workload Balance ({cand.breakdown.lowWorkload > 0 ? `+${cand.breakdown.lowWorkload}` : cand.breakdown.lowWorkload}/15)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAssignSubstitute(cand)}
                  disabled={!cand.isAvailable || assigning}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: cand.isAvailable ? (isTop ? '#1e40af' : '#2563eb') : '#cbd5e1',
                    color: cand.isAvailable ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: cand.isAvailable ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <UserCheck size={18} />
                  <span>
                    {cand.isAvailable
                      ? '[ Assign Substitute & Send Email ]'
                      : (cand.isAbsent ? 'Absent / On Leave' : 'Busy at this time slot')}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartSubstitutePage;
