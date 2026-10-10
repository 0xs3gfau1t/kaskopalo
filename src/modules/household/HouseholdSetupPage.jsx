import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHousehold } from './HouseholdContext.jsx';

export function HouseholdSetupPage() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createHousehold, joinHousehold, error } = useHousehold();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createHousehold(name);
      navigate('/');
    } catch {
      // Handled by context
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await joinHousehold(code);
      navigate('/');
    } catch {
      // Handled by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome to Kaskopalo</h2>
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('create')}
          style={{ flex: 1, padding: '0.75rem', fontWeight: activeTab === 'create' ? 'bold' : 'normal', borderBottom: activeTab === 'create' ? '2px solid #3b82f6' : 'none', color: activeTab === 'create' ? '#3b82f6' : '#64748b' }}
        >
          Create Flat
        </button>
        <button
          onClick={() => setActiveTab('join')}
          style={{ flex: 1, padding: '0.75rem', fontWeight: activeTab === 'join' ? 'bold' : 'normal', borderBottom: activeTab === 'join' ? '2px solid #3b82f6' : 'none', color: activeTab === 'join' ? '#3b82f6' : '#64748b' }}
        >
          Join with Code
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {activeTab === 'create' ? (
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Household / Flat Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Baker Street 221B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}
          >
            {submitting ? 'Creating...' : 'Create Household'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>8-Character Invite Code</label>
            <input
              type="text"
              required
              placeholder="e.g. 7K4X9B2W"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}
          >
            {submitting ? 'Joining...' : 'Join Household'}
          </button>
        </form>
      )}
    </div>
  );
}
