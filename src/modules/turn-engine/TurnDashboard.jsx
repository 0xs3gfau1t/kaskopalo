import React, { useState } from 'react';
import { useTurnEngine } from './useTurnEngine.js';
import { ModeSelector } from './ModeSelector.jsx';
import { TurnActions } from './TurnActions.jsx';
import { DebtBadge } from './DebtBadge.jsx';

export function TurnDashboardCard({ chore }) {
  const {
    modes,
    selectedModeKey,
    setSelectedModeKey,
    currentQueue,
    whoseTurnUid,
    whoseTurnName,
    loading,
    error,
    markDone,
    skip,
  } = useTurnEngine(chore.id);

  const [submitting, setSubmitting] = useState(false);

  const handleMarkDone = async (workerUid) => {
    setSubmitting(true);
    try {
      await markDone(workerUid);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async (skipUid) => {
    setSubmitting(true);
    try {
      await skip(skipUid);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDebt = currentQueue?.debt?.[whoseTurnUid] || 0;

  return (
    <div
      style={{
        padding: '1.25rem',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>{chore.name}</h3>
      </div>

      {error && (
        <div style={{ padding: '0.5rem', marginBottom: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <ModeSelector
        modes={modes}
        selectedModeKey={selectedModeKey}
        onSelect={setSelectedModeKey}
      />

      <div
        style={{
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '6px',
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
          Current Turn
        </span>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', marginTop: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {loading ? 'Checking...' : whoseTurnName}
          <DebtBadge count={currentDebt} />
        </div>
      </div>

      {!loading && whoseTurnUid && (
        <TurnActions
          whoseTurnUid={whoseTurnUid}
          onMarkDone={handleMarkDone}
          onSkip={handleSkip}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export function TurnDashboard({ chores = [] }) {
  if (chores.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No chores setup yet.</p>
        <p style={{ fontSize: '0.9rem' }}>Go to the Chores tab to add your flat chores!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {chores.map((chore) => (
        <TurnDashboardCard key={chore.id} chore={chore} />
      ))}
    </div>
  );
}
