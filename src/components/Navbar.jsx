import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../modules/identity/index.js';
import { useHousehold } from '../modules/household/index.js';

export function Navbar() {
  const { user, logout } = useAuth();
  const { currentHousehold, households, switchHousehold } = useHousehold();

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink to="/" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 'bold', fontSize: '1.15rem' }}>
          🔄 Kaskopalo
        </NavLink>

        {households.length > 1 && (
          <select
            value={currentHousehold?.id || ''}
            onChange={(e) => switchHousehold(e.target.value)}
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          >
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
        {user ? (
          <>
            <span style={{ color: '#475569', fontWeight: '500' }}>{user.displayName || user.email}</span>
            <button
              onClick={logout}
              style={{ color: '#ef4444', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
            Login
          </NavLink>
        )}
      </div>
    </header>
  );
}

export function BottomNav() {
  const navItemStyle = ({ isActive }) => ({
    flex: 1,
    textAlign: 'center',
    padding: '0.75rem 0',
    textDecoration: 'none',
    color: isActive ? '#3b82f6' : '#64748b',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '0.85rem',
  });

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        zIndex: 10,
      }}
    >
      <NavLink to="/" style={navItemStyle}>
        Turns
      </NavLink>
      <NavLink to="/chores" style={navItemStyle}>
        Chores
      </NavLink>
      <NavLink to="/household/settings" style={navItemStyle}>
        Flat
      </NavLink>
    </nav>
  );
}
