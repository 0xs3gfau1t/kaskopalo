import React, { useState } from 'react';
import { useHousehold } from '../household/index.js';

export function TurnActions({ whoseTurnUid, onMarkDone, onSkip, submitting }) {
  const { getMembersList } = useHousehold();
  const members = getMembersList();
  const [selectedWorker, setSelectedWorker] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onMarkDone(whoseTurnUid)}
          disabled={submitting}
          style={{
            flex: 2,
            padding: '0.75rem',
            background: '#10b981',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
          }}
        >
          Mark Done
        </button>
        <button
          onClick={() => onSkip(whoseTurnUid)}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#f1f5f9',
            color: '#475569',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          Skip Turn
        </button>
      </div>

      {/* Manual assignment option */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>Someone else did it:</span>
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        >
          <option value="">Select flatmate...</option>
          {members
            .filter((m) => m.uid !== whoseTurnUid)
            .map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName}
              </option>
            ))}
        </select>
        <button
          onClick={() => {
            if (selectedWorker) {
              onMarkDone(selectedWorker);
              setSelectedWorker('');
            }
          }}
          disabled={!selectedWorker || submitting}
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.85rem',
            background: '#3b82f6',
            color: '#fff',
            borderRadius: '4px',
            opacity: selectedWorker ? 1 : 0.5,
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
