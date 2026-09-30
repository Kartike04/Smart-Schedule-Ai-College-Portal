import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { Building2, Plus, Layers, BookOpen, UserPlus } from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await API.post('/departments', {
        code: newCode,
        name: newName,
        academicYears: ['2026-27'],
        classes: [`F.Y. B.Sc. (${newCode})`, `S.Y. B.Sc. (${newCode})`, `T.Y. B.Sc. (${newCode})`],
        divisions: ['A', 'B'],
        rooms: ['501', '502']
      });
      setMessage(`Department ${newName} created successfully!`);
      setNewCode('');
      setNewName('');
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
            Department Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Configure academic departments, classes, divisions, and rooms for TSDC
          </p>
        </div>

        <button
          onClick={() => setShowDeptModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#1e40af',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Departments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {departments.map((dept) => (
          <div key={dept._id} style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3' }}>
                  CODE: {dept.code}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
                  {dept.name}
                </h3>
              </div>
              <Building2 size={28} style={{ color: '#2563eb' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: '#334155' }}>Configured Classes:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {(dept.classes || []).map((c, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontSize: '0.775rem', fontWeight: 600 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ color: '#334155' }}>Divisions:</strong>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {(dept.divisions || []).map((d, idx) => (
                    <span key={idx} style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                      Div {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ color: '#334155' }}>Associated Rooms / Labs:</strong>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                  {(dept.rooms || []).join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showDeptModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '20px' }}>
              Add New Department
            </h3>

            <form onSubmit={handleAddDept}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI or MCA"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Full Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Sc. Artificial Intelligence"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#1e40af', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
