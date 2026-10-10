import React, { useState } from 'react';
import { useHousehold } from '../household/index.js';
import { useChores } from './useChores.js';
import { ChoreForm } from './ChoreForm.jsx';

export function ChoreListPage() {
  const { currentHousehold } = useHousehold();
  const { chores, loading, error, addChore, updateChore, deleteChore } = useChores(currentHousehold?.id);
  const [editingId, setEditingId] = useState(null);

  if (!currentHousehold) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please select or join a household first.</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginBottom: '0.25rem' }}>Chores</h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Manage repeating chores for {currentHousehold.name}
      </p>

      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Add Chore */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Add New Chore</h3>
        <ChoreForm onSave={addChore} />
      </div>

      {/* Chores List */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Active Chores ({chores.length})</h3>
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading chores...</p>
      ) : chores.length === 0 ? (
        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No chores yet. Add one above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {chores.map((chore) => (
            <div
              key={chore.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
              }}
            >
              {editingId === chore.id ? (
                <div style={{ flex: 1 }}>
                  <ChoreForm
                    initialValue={chore.name}
                    onSave={async (name) => {
                      await updateChore(chore.id, name);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <>
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>{chore.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setEditingId(chore.id)}
                      style={{ fontSize: '0.85rem', color: '#3b82f6' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete "${chore.name}"? Turn history will also be removed.`)) {
                          await deleteChore(chore.id);
                        }
                      }}
                      style={{ fontSize: '0.85rem', color: '#ef4444' }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
