import React from 'react';

export function DebtBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.45rem',
        background: '#fef3c7',
        color: '#b45309',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        marginLeft: '0.5rem',
        border: '1px solid #fde68a',
      }}
      title={`${count} turn(s) owed in debt`}
    >
      +{count} debt
    </span>
  );
}
