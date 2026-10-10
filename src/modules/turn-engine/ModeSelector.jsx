import React from 'react';

export function ModeSelector({ modes, selectedModeKey, onSelect }) {
  if (!modes || modes.length <= 1) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        Participating Mode
      </label>
      <select
        value={selectedModeKey}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: '#fff',
          fontSize: '0.9rem',
          color: '#1e293b',
        }}
      >
        {modes.map((m) => (
          <option key={m.modeKey} value={m.modeKey}>
            {m.modeLabel} ({m.memberUids.length} people)
          </option>
        ))}
      </select>
    </div>
  );
}
