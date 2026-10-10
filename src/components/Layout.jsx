import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, BottomNav } from './Navbar.jsx';
import { useAuth } from '../modules/identity/index.js';

export function Layout() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '1rem', paddingBottom: user ? '4.5rem' : '1rem' }}>
        <Outlet />
      </main>
      {user && <BottomNav />}
    </div>
  );
}
