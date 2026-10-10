import React from 'react';
import { useHousehold } from './HouseholdContext.jsx';
import { useAuth } from '../identity/index.js';

export function HouseholdSettingsPage() {
  const { currentHousehold, leaveHousehold, getMembersList } = useHousehold();
  const { user } = useAuth();

  if (!currentHousehold) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No household selected.</div>;
  }

  const members = getMembersList();

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>{currentHousehold.name}</h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Settings & Members</p>

      {/* Invite Code Display Box */}
      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1', marginBottom: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', marginBottom: '0.25rem' }}>Invite Code</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '4px', color: '#0f172a' }}>{currentHousehold.inviteCode || 'N/A'}</p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Share this code with your flatmates</p>
      </div>

      {/* Members list */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Members ({members.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        {members.map((m) => (
          <div key={m.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
            <div>
              <span style={{ fontWeight: '500' }}>{m.displayName}</span>
              {m.uid === user?.uid && <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginLeft: '0.5rem' }}>(You)</span>}
            </div>
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: m.role === 'admin' ? '#dbeafe' : '#e2e8f0', color: m.role === 'admin' ? '#1e40af' : '#475569', borderRadius: '4px', textTransform: 'capitalize' }}>
              {m.role}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          if (window.confirm('Are you sure you want to leave this household?')) {
            await leaveHousehold();
          }
        }}
        style={{ width: '100%', padding: '0.75rem', color: '#ef4444', border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '6px', fontWeight: 'bold' }}
      >
        Leave Household
      </button>
    </div>
  );
}
