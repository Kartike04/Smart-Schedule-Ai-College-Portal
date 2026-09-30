import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { Users, UserPlus, Search, Edit2, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react';

const FacultyManagement = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    email: '',
    password: 'faculty123',
    employeeId: '',
    department: 'B.Sc. IT',
    subjects: '',
    skills: '',
    phone: '',
    status: 'Active'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, [search, deptFilter]);

  const fetchFaculty = async () => {
    try {
      const res = await API.get(`/faculty?department=${deptFilter}&search=${search}`);
      setFacultyList(res.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      abbreviation: '',
      email: '',
      password: 'faculty123',
      employeeId: `TSDC-${Date.now().toString().slice(-4)}`,
      department: deptFilter || 'B.Sc. IT',
      subjects: '',
      skills: '',
      phone: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingId(fac._id);
    setFormData({
      name: fac.name,
      abbreviation: fac.abbreviation,
      email: fac.email,
      password: '',
      employeeId: fac.employeeId,
      department: fac.department,
      subjects: Array.isArray(fac.subjects) ? fac.subjects.join(', ') : (fac.subjects || ''),
      skills: Array.isArray(fac.skills) ? fac.skills.join(', ') : (fac.skills || ''),
      phone: fac.phone || '',
      status: fac.status || 'Active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await API.delete(`/faculty/${id}`);
      setMessage('Faculty member deleted successfully');
      fetchFaculty();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete faculty');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      if (editingId) {
        await API.put(`/faculty/${editingId}`, formData);
        setMessage('Faculty updated successfully!');
      } else {
        await API.post('/faculty', formData);
        setMessage('Faculty created successfully!');
      }
      setShowModal(false);
      fetchFaculty();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save faculty');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
            Faculty Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Manage college faculty members, abbreviations, skills, and department assignments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
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
          <UserPlus size={18} />
          <span>Add New Faculty</span>
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

      {/* Filter & Search Bar */}
      <div style={{
        background: '#ffffff',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, minWidth: '240px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px' }}>
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, abbreviation, employee ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <option value="">All Departments</option>
            <option value="B.Sc. IT">B.Sc. IT</option>
            <option value="B.Sc. CS">B.Sc. CS</option>
            <option value="B.Sc. DS">B.Sc. DS</option>
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="tt-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Faculty Name</th>
              <th>Abbreviation</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th style={{ textAlign: 'left' }}>Subjects / Skills</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  No faculty records found.
                </td>
              </tr>
            ) : (
              facultyList.map((fac) => (
                <tr key={fac._id}>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>
                    {fac.name}
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>{fac.email}</div>
                  </td>
                  <td>
                    <span style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      {fac.abbreviation}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>
                    {fac.employeeId}
                  </td>
                  <td style={{ fontWeight: 600 }}>{fac.department}</td>
                  <td style={{ textAlign: 'left', fontSize: '0.8rem' }}>
                    {(fac.skills || []).map((sk, idx) => (
                      <span key={idx} style={{ display: 'inline-block', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', margin: '2px', fontSize: '0.725rem', border: '1px solid #e2e8f0' }}>
                        {sk}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: fac.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color: fac.status === 'Active' ? '#15803d' : '#b91c1c'
                    }}>
                      {fac.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(fac)}
                        style={{ padding: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                        title="Edit Faculty"
                      >
                        <Edit2 size={16} style={{ color: '#2563eb' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(fac._id)}
                        style={{ padding: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                        title="Delete Faculty"
                      >
                        <Trash2 size={16} style={{ color: '#e11d48' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
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
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '20px' }}>
              {editingId ? 'Edit Faculty Record' : 'Add New Faculty Member'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Abbreviation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ARS"
                    value={formData.abbreviation}
                    onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}
                  >
                    <option value="B.Sc. IT">B.Sc. IT</option>
                    <option value="B.Sc. CS">B.Sc. CS</option>
                    <option value="B.Sc. DS">B.Sc. DS</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontWeight: 600 }}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {!editingId && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Account Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Subjects / Courses (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. DNET, Dot Net Core, AIA"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Subject Skills (for Smart Substitution algorithm)</label>
                <input
                  type="text"
                  placeholder="e.g. DNET, PWA, C#, Java, AI"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#1e40af', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                  {editingId ? 'Update Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
