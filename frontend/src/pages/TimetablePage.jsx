import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import DepartmentSelector from '../components/DepartmentSelector';
import TimetableGrid from '../components/TimetableGrid';
import { Printer, Download, FileSpreadsheet, Upload, Plus, Calendar as CalendarIcon, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TimetablePage = ({ currentDept, onDeptChange }) => {
  const [searchParams] = useSearchParams();
  const paramDept = searchParams.get('department');
  const paramDate = searchParams.get('date');
  const paramClass = searchParams.get('class');
  const paramDiv = searchParams.get('division');

  const [department, setDepartment] = useState(paramDept || currentDept || 'B.Sc. IT');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [className, setClassName] = useState(paramClass || 'T.Y. B.Sc. (IT)');
  const [division, setDivision] = useState(paramDiv || 'C');
  const [selectedDate, setSelectedDate] = useState(paramDate || ''); // empty = Original Timetable mode
  const [timetableData, setTimetableData] = useState(null);
  const [substitutions, setSubstitutions] = useState([]);
  const [workloadSummary, setWorkloadSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (paramDept) setDepartment(paramDept);
    if (paramDate) setSelectedDate(paramDate);
    if (paramClass) setClassName(paramClass);
    if (paramDiv) setDivision(paramDiv);
  }, [paramDept, paramDate, paramClass, paramDiv]);

  useEffect(() => {
    if (currentDept && !paramDept) setDepartment(currentDept);
  }, [currentDept]);

  useEffect(() => {
    if (!paramClass) {
      if (department === 'B.Sc. IT') {
        setClassName('T.Y. B.Sc. (IT)');
        setDivision('C');
      } else if (department === 'B.Sc. CS') {
        setClassName('T.Y. B.Sc. (CS)');
        setDivision('A');
      } else if (department === 'B.Sc. DS') {
        setClassName('T.Y. B.Sc. (DS)');
        setDivision('A');
      }
    }
  }, [department]);

  useEffect(() => {
    fetchTimetable();
  }, [department, academicYear, className, division, selectedDate]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = `/timetable?department=${department}&academicYear=${academicYear}&class=${className}&division=${division}`;
      if (selectedDate) {
        url += `&date=${selectedDate}`;
      }

      const res = await API.get(url);
      setTimetableData(res.data);
      setSubstitutions(res.data.substitutions || []);
      setWorkloadSummary(res.data.workloadSummary || []);
    } catch (error) {
      setTimetableData(null);
      setSubstitutions([]);
      setWorkloadSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptSelect = (newDept) => {
    setDepartment(newDept);
    if (newDept === 'B.Sc. IT') {
      setClassName('T.Y. B.Sc. (IT)');
      setDivision('C');
    } else if (newDept === 'B.Sc. CS') {
      setClassName('T.Y. B.Sc. (CS)');
      setDivision('A');
    } else if (newDept === 'B.Sc. DS') {
      setClassName('T.Y. B.Sc. (DS)');
      setDivision('A');
    }
    if (onDeptChange) onDeptChange(newDept);
  };

  const printTimetable = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element = document.getElementById('printable-timetable');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TSDC_${department}_${className}_Div${division}_Timetable_${selectedDate || 'Original'}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  };

  const downloadExcel = () => {
    if (!timetableData || !timetableData.slots) return;

    const excelRows = timetableData.slots.map(s => ({
      Department: timetableData.department,
      'Academic Year': timetableData.academicYear,
      Class: timetableData.class,
      Division: timetableData.division,
      Day: s.day,
      'Start Time': s.startTime,
      'End Time': s.endTime,
      Subject: s.subject || '',
      Faculty: s.facultyName || '',
      'Faculty Abbreviation': s.facultyAbbr || '',
      Room: s.room || timetableData.roomNo,
      Type: s.slotType
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');
    XLSX.writeFile(workbook, `TSDC_${department}_${className}_Div${division}_Timetable_${selectedDate || 'Original'}.xlsx`);
  };

  return (
    <div>
      {/* Top Header & Actions */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
            College Timetable & AI Workload Control
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            View Master Timetable or Daily Timetables uploaded from Excel with AI Substitutions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/excel-import')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Upload size={16} />
            <span>Upload Daily Excel</span>
          </button>

          <button
            onClick={printTimetable}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button
            onClick={downloadPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={downloadExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Daily Excel Uploaded Banner if applicable */}
      {timetableData?.isDailyExcelUploaded && (
        <div className="no-print" style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#15803d',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} />
            <span>Daily Excel Timetable active for Date: {selectedDate} ({department})</span>
          </div>
          <span style={{ fontSize: '0.775rem', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', border: '1px solid #86efac' }}>
            ⚡ Updated Live
          </span>
        </div>
      )}

      {/* Date & Timetable Mode Toggle Control */}
      <div className="no-print" style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarIcon size={20} style={{ color: '#2563eb' }} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              Select Timetable View Mode
            </div>
            <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
              Original Master Timetable stays static. Pick a date to view Daily Timetables or AI Substitutions.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedDate('')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: !selectedDate ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: !selectedDate ? '#eff6ff' : '#ffffff',
              color: !selectedDate ? '#1e40af' : '#475569',
              cursor: 'pointer'
            }}
          >
            Original Master Timetable
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e11d48',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
              >
                Clear Date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Department Filter Selector */}
      <div className="no-print">
        <DepartmentSelector
          department={department}
          setDepartment={handleDeptSelect}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          className={className}
          setClassName={setClassName}
          division={division}
          setDivision={setDivision}
          room={timetableData?.roomNo}
        />
      </div>

      {/* Timetable Display */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading timetable data for {department}...
        </div>
      ) : timetableData ? (
        <TimetableGrid
          timetableData={timetableData}
          substitutions={substitutions}
          department={department}
          selectedDate={selectedDate}
          workloadSummary={workloadSummary}
        />
      ) : (
        <div className="timetable-paper" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 600 }}>
            No timetable has been uploaded for this department.
          </h3>
          <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem', maxWidth: '500px', margin: '8px auto 20px auto' }}>
            There is currently no timetable configured for {department} ({className} Div {division}).
            Admin can upload an Excel timetable file or configure it manually.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/excel-import')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#1e40af',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Upload size={18} />
              <span>Upload Excel Timetable</span>
            </button>

            <button
              onClick={() => navigate('/departments')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              <span>Manage Department</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
