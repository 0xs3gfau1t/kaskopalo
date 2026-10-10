import React, { useState } from 'react';

export function ChoreForm({ onSave, onCancel, initialValue = '' }) {
  const [name, setName] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Chore name cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(name.trim());
      setName('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => { setError(''); setName(e.target.value); }}
          placeholder="e.g. Throw Garbage, Clean Bathroom"
          maxLength={50}
          style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontWeight: '500' }}
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
