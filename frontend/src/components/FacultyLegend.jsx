import React from 'react';

const FacultyLegend = ({ department = 'B.Sc. IT' }) => {
  const defaultItLegend = [
    { srNo: 1, course: 'DNET – Dot Net Core and Progressive Web Application', faculty: 'Mr. Aman Singh', abbreviation: 'ARS' },
    { srNo: 2, course: 'AIA – Artificial Intelligence & Applications', faculty: 'Mr. Jasar Shaikh', abbreviation: 'JS' },
    { srNo: 3, course: 'FSDM – Full Stack Development MERN Practical (2)', faculty: 'Mr. Pratharv Surve', abbreviation: 'PPS' },
    { srNo: 4, course: 'IoT – Internet of Things: Theory and Practice', faculty: 'Ms. Stephy Thomas', abbreviation: 'SET' },
    { srNo: 5, course: 'EJ – Enterprise Java Practical', faculty: 'Mrs. Minal Shete', abbreviation: 'MVS' },
    { srNo: 6, course: 'IKS – Indian Knowledge System in Information Technology', faculty: 'Mrs. Minal Shete', abbreviation: 'MVS' },
    { srNo: 7, course: 'RARP – Regression Analysis with R Programming', faculty: 'Mr. Sudhakar Vishwakarma', abbreviation: 'SCV' }
  ];

  return (
    <div style={{ marginTop: '24px', borderTop: '2px solid #cbd5e1', paddingTop: '16px' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>
        FACULTY & COURSE LEGEND ({department})
      </h4>
      <table className="tt-table" style={{ fontSize: '0.8rem' }}>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Sr. No.</th>
            <th style={{ textAlign: 'left' }}>Course / Subject Name</th>
            <th style={{ textAlign: 'left' }}>Faculty Name</th>
            <th style={{ width: '120px' }}>Abbreviation</th>
          </tr>
        </thead>
        <tbody>
          {defaultItLegend.map((item) => (
            <tr key={item.srNo}>
              <td style={{ fontWeight: 600 }}>{item.srNo}</td>
              <td style={{ textAlign: 'left', fontWeight: 500 }}>{item.course}</td>
              <td style={{ textAlign: 'left', color: '#1e293b' }}>{item.faculty}</td>
              <td>
                <span style={{
                  background: '#e0e7ff',
                  color: '#3730a3',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {item.abbreviation}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyLegend;
