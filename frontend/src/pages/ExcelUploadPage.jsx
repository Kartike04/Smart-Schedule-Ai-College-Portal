import React, { useState } from 'react';
import API from '../utils/api';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Calendar, Layers, Eye, RefreshCw, UserCheck, Sparkles, Plus, Trash2, Edit3, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ExcelUploadPage = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [uploadType, setUploadType] = useState('daily'); // 'daily' or 'master'
  const [targetDate, setTargetDate] = useState(todayStr);
  const [file, setFile] = useState(null);
  
  const [department, setDepartment] = useState('B.Sc. IT');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [className, setClassName] = useState('T.Y. B.Sc. (IT)');
  const [division, setDivision] = useState('C');
  
  const [editableRows, setEditableRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // Helper to normalize day name
  const normDay = (str) => {
    if (!str) return 'Monday';
    const l = str.toString().trim().toLowerCase();
    if (l.startsWith('mon')) return 'Monday';
    if (l.startsWith('tue')) return 'Tuesday';
    if (l.startsWith('wed')) return 'Wednesday';
    if (l.startsWith('thu')) return 'Thursday';
    if (l.startsWith('fri')) return 'Friday';
    if (l.startsWith('sat')) return 'Saturday';
    return 'Monday';
  };

  // Client-side Excel reader and editable row converter
  const processExcelFile = (uploadedFile) => {
    setFile(uploadedFile);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet);

        if (!rawRows || rawRows.length === 0) {
          setErrorMsg('The selected Excel sheet contains no readable rows.');
          setEditableRows([]);
          setSummary(null);
          return;
        }

        // Auto-detect Department
        const firstRowStr = JSON.stringify(rawRows[0]);
        if (firstRowStr.includes('CS') || firstRowStr.includes('Computer Science')) {
          setDepartment('B.Sc. CS');
          setClassName('T.Y. B.Sc. (CS)');
        } else if (firstRowStr.includes('DS') || firstRowStr.includes('Data Science')) {
          setDepartment('B.Sc. DS');
          setClassName('T.Y. B.Sc. (DS)');
        } else if (firstRowStr.includes('IT')) {
          setDepartment('B.Sc. IT');
          setClassName('T.Y. B.Sc. (IT)');
        }

        const facultySet = new Set();
        let lectures = 0;
        let practicals = 0;
        let breaks = 0;

        const formatted = rawRows.map((r, i) => {
          const day = normDay(r['Day'] || r['day'] || r['Days'] || r['Day Name'] || (targetDate ? new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Monday'));
          const startTime = r['Start Time'] || r['startTime'] || r['Start'] || r['Time'] || '08:00 AM';
          const endTime = r['End Time'] || r['endTime'] || r['End'] || '09:00 AM';
          const subject = r['Subject'] || r['subject'] || r['Sub'] || r['Course'] || '';
          const faculty = r['Faculty'] || r['faculty'] || r['Teacher'] || r['Prof'] || '';
          const facultyAbbr = r['Faculty Abbreviation'] || r['facultyAbbr'] || r['Abbreviation'] || (faculty ? faculty.slice(0, 3).toUpperCase() : '');
          const room = r['Room'] || r['room'] || r['Room No'] || '620';
          const lab = r['Lab'] || r['lab'] || '';
          const batch = r['Batch'] || r['batch'] || '';

          const isBreak = (subject + ' ' + (r['Status'] || '')).toLowerCase().includes('break');
          const isLab = lab || batch || (r['Status'] || '').toLowerCase().includes('practical');

          if (faculty && !isBreak) facultySet.add(faculty);

          if (isBreak) breaks++;
          else if (isLab) practicals++;
          else lectures++;

          return {
            id: i + 1,
            day,
            startTime,
            endTime,
            subject: subject || (isBreak ? 'BREAK' : 'Lecture'),
            faculty,
            facultyAbbr,
            room: lab || room,
            lab,
            batch,
            status: isBreak ? 'Break' : (isLab ? 'Practical' : 'Lecture')
          };
        });

        setEditableRows(formatted);
        setSummary({
          totalRows: formatted.length,
          totalLectures: lectures,
          totalPracticals: practicals,
          totalBreaks: breaks,
          facultyCount: facultySet.size,
          facultyList: Array.from(facultySet)
        });

      } catch (err) {
        console.error('Client Excel preview error:', err);
        setErrorMsg('Could not parse Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleRowChange = (id, field, value) => {
    setEditableRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddRow = () => {
    const newId = editableRows.length + 1;
    setEditableRows(prev => [
      ...prev,
      {
        id: newId,
        day: 'Monday',
        startTime: '08:00 AM',
        endTime: '09:00 AM',
        subject: 'New Subject',
        faculty: 'Faculty Name',
        facultyAbbr: 'FAC',
        room: '620',
        lab: '',
        batch: '',
        status: 'Lecture'
      }
    ]);
  };

  const handleDeleteRow = (id) => {
    setEditableRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file && editableRows.length === 0) {
      setErrorMsg('Please select an Excel file or add rows manually.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('department', department);
    formData.append('academicYear', academicYear);
    formData.append('class', className);
    formData.append('division', division);
    if (uploadType === 'daily' && targetDate) {
      formData.append('date', targetDate);
    }

    try {
      let res;
      if (file) {
        res = await API.post('/excel/upload-timetable', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Post manual slots array to timetable
        const slots = editableRows.map(r => ({
          day: r.day,
          startTime: r.startTime,
          endTime: r.endTime,
          slotType: r.status,
          subject: r.subject,
          facultyName: r.faculty,
          facultyAbbr: r.facultyAbbr,
          room: r.room
        }));

        res = await API.post('/timetable', {
          department,
          academicYear,
          class: className,
          division,
          roomNo: '620',
          slots
        });
      }

      setSuccessMsg(res.data.message || 'Timetable published to MongoDB successfully!');

      setTimeout(() => {
        if (res.data.redirectUrl) {
          navigate(res.data.redirectUrl);
        } else {
          navigate(`/timetable?department=${encodeURIComponent(department)}${uploadType === 'daily' ? `&date=${targetDate}` : ''}`);
        }
      }, 1000);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload timetable to MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleRows = [
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Monday', 'Start Time': '08:00 AM', 'End Time': '09:00 AM', Subject: 'DNET', Faculty: 'Mr. Aman Singh', 'Faculty Abbreviation': 'ARS', Room: '620', Lab: '', Batch: '', Status: 'Lecture' },
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Monday', 'Start Time': '09:00 AM', 'End Time': '10:00 AM', Subject: 'AIADJ', Faculty: 'Mr. Jasar Shaikh', 'Faculty Abbreviation': 'JS', Room: '620', Lab: '', Batch: '', Status: 'Lecture' },
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Monday', 'Start Time': '10:00 AM', 'End Time': '10:15 AM', Subject: 'SHORT BREAK', Faculty: '', 'Faculty Abbreviation': '', Room: '', Lab: '', Batch: '', Status: 'Break' },
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Monday', 'Start Time': '10:15 AM', 'End Time': '11:15 AM', Subject: 'RARP', Faculty: 'Mr. Sudhakar Vishwakarma', 'Faculty Abbreviation': 'SCV', Room: '', Lab: 'Lab LL', Batch: 'X', Status: 'Practical' },
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Monday', 'Start Time': '10:15 AM', 'End Time': '11:15 AM', Subject: 'RARP', Faculty: 'Mr. Sudhakar Vishwakarma', 'Faculty Abbreviation': 'SCV', Room: '', Lab: 'Lab EL', Batch: 'Y', Status: 'Practical' },
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Tuesday', 'Start Time': '08:00 AM', 'End Time': '09:00 AM', Subject: 'DNET', Faculty: 'Mr. Aman Singh', 'Faculty Abbreviation': 'ARS', Room: '620', Lab: '', Batch: '', Status: 'Lecture' },
      { Department: 'B.Sc. IT', 'Academic Year': '2026-27', Class: 'T.Y. B.Sc. (IT)', Division: 'C', Day: 'Tuesday', 'Start Time': '09:00 AM', 'End Time': '10:00 AM', Subject: 'AIADJ', Faculty: 'Mr. Jasar Shaikh', 'Faculty Abbreviation': 'JS', Room: '620', Lab: '', Batch: '', Status: 'Lecture' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable Template');
    XLSX.writeFile(workbook, 'Smart_Schedule_AI_Sample_Timetable.xlsx');
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
      {/* Page Title & Intro */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <Sparkles size={14} /> Smart Instant Upload & Interactive Schedule Editor
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Upload & Manage Timetable Excel
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Upload Daily or Master Timetables (.xlsx / .xls). Preview, edit slots in real-time, and save directly to MongoDB!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={downloadSampleTemplate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#166534',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(22, 101, 52, 0.2)'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Download Sample Excel Template</span>
          </button>

          <button
            onClick={() => navigate('/timetable')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Eye size={16} />
            <span>View Live Timetable</span>
          </button>
        </div>
      </div>

      {/* Main Form & Upload Controls */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
        {successMsg && (
          <div style={{ padding: '14px 16px', background: '#dcfce7', color: '#15803d', borderRadius: '10px', marginBottom: '20px', fontWeight: 700, border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} />
            <div>
              <div>{successMsg}</div>
              <div style={{ fontSize: '0.775rem', color: '#166534', fontWeight: 500 }}>Redirecting to live timetable view...</div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '14px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', marginBottom: '20px', fontWeight: 700, border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Upload Mode</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }}
              >
                <option value="daily">Daily Timetable (Date Override)</option>
                <option value="master">Master Timetable (Weekly Default)</option>
              </select>
            </div>

            {uploadType === 'daily' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #86efac', marginTop: '4px', fontWeight: 700, background: '#f0fdf4' }}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Target Department</label>
              <select
                value={department}
                onChange={(e) => {
                  const dept = e.target.value;
                  setDepartment(dept);
                  if (dept === 'B.Sc. IT') setClassName('T.Y. B.Sc. (IT)');
                  else if (dept === 'B.Sc. CS') setClassName('T.Y. B.Sc. (CS)');
                  else if (dept === 'B.Sc. DS') setClassName('T.Y. B.Sc. (DS)');
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }}
              >
                <option value="B.Sc. IT">B.Sc. IT</option>
                <option value="B.Sc. CS">B.Sc. CS</option>
                <option value="B.Sc. DS">B.Sc. DS</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Drag & Drop File Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: file ? '2px solid #2563eb' : '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '24px 20px',
              textAlign: 'center',
              background: file ? '#f0f9ff' : '#f8fafc',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={40} style={{ color: file ? '#2563eb' : '#64748b', marginBottom: '8px' }} />
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {file ? file.name : 'Click to select or Drag & Drop Excel Timetable (.xlsx / .xls)'}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.775rem', marginTop: '4px' }}>
              Supports row-based files, matrix format, custom header names, and automatic batch detection!
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              style={{ display: 'block', margin: '12px auto 0 auto' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!file && editableRows.length === 0)}
            style={{
              width: '100%',
              padding: '14px',
              background: loading || (!file && editableRows.length === 0) ? '#cbd5e1' : '#1e40af',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading || (!file && editableRows.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)'
            }}
          >
            {loading ? <RefreshCw size={20} className="spin" /> : <Upload size={20} />}
            <span>{loading ? 'Saving to MongoDB...' : 'Upload & Save to MongoDB'}</span>
          </button>
        </form>
      </div>

      {/* Interactive Visual Schedule Table Editor & Live Preview */}
      {editableRows.length > 0 && (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Interactive Slot Editor ({editableRows.length} Slots Parsed)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                You can review or edit any parsed field directly in this table before saving to MongoDB.
              </p>
            </div>

            <button
              onClick={handleAddRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Add Custom Slot</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#334155', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>#</th>
                  <th style={{ padding: '10px' }}>Day</th>
                  <th style={{ padding: '10px' }}>Start Time</th>
                  <th style={{ padding: '10px' }}>End Time</th>
                  <th style={{ padding: '10px' }}>Subject</th>
                  <th style={{ padding: '10px' }}>Faculty</th>
                  <th style={{ padding: '10px' }}>Abbr</th>
                  <th style={{ padding: '10px' }}>Room/Lab</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {editableRows.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '6px' }}>
                      <select
                        value={r.day}
                        onChange={(e) => handleRowChange(r.id, 'day', e.target.value)}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={r.startTime}
                        onChange={(e) => handleRowChange(r.id, 'startTime', e.target.value)}
                        style={{ width: '85px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={r.endTime}
                        onChange={(e) => handleRowChange(r.id, 'endTime', e.target.value)}
                        style={{ width: '85px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={r.subject}
                        onChange={(e) => handleRowChange(r.id, 'subject', e.target.value)}
                        style={{ width: '130px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#1e40af' }}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={r.faculty}
                        onChange={(e) => handleRowChange(r.id, 'faculty', e.target.value)}
                        style={{ width: '150px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={r.facultyAbbr}
                        onChange={(e) => handleRowChange(r.id, 'facultyAbbr', e.target.value)}
                        style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={r.room}
                        onChange={(e) => handleRowChange(r.id, 'room', e.target.value)}
                        style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <button
                        onClick={() => handleDeleteRow(r.id)}
                        style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                        title="Delete slot"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadPage;
