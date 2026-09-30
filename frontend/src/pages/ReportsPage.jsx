import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { FileText, Printer, Download, Building2, Users } from 'lucide-react';
import { useCollege } from '../context/CollegeContext';

const ReportsPage = () => {
  const { collegeName } = useCollege();
  const [reportData, setReportData] = useState({
    facultyCount: 6,
    deptCount: 3,
    substitutionsCount: 0,
    attendanceCount: 0
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [facRes, deptRes, subRes, attRes] = await Promise.all([
        API.get('/faculty'),
        API.get('/departments'),
        API.get('/substitute'),
        API.get('/attendance')
      ]);

      setReportData({
        facultyCount: facRes.data.length || 6,
        deptCount: deptRes.data.length || 3,
        substitutionsCount: subRes.data.length || 0,
        attendanceCount: attRes.data.length || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
            System Reports & Summary
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {collegeName} — Smart Schedule AI Operational Metrics
          </p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Printer size={18} />
          <span>Print Summary Report</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TOTAL DEPARTMENTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>{reportData.deptCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>B.Sc. IT, B.Sc. CS, B.Sc. DS</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>REGISTERED FACULTY</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{reportData.facultyCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Active faculty accounts</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>SUBSTITUTE ALLOCATIONS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{reportData.substitutionsCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '4px' }}>Smart allocations created</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>ATTENDANCE LOGS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{reportData.attendanceCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>Verified faculty check-ins</div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
