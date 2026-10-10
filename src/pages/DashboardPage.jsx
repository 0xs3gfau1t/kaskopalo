import React from 'react';
import { useHousehold } from '../modules/household/index.js';
import { useChores } from '../modules/chores/index.js';
import { TurnDashboard } from '../modules/turn-engine/index.js';

export function DashboardPage() {
  const { currentHousehold } = useHousehold();
  const { chores, loading: choresLoading } = useChores(currentHousehold?.id);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>{currentHousehold?.name}</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Whose turn is it?</p>
      </div>

      {choresLoading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading turns...</p>
      ) : (
        <TurnDashboard chores={chores} />
      )}
    </div>
  );
}
