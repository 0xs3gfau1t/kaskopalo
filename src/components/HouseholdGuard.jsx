import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useHousehold } from '../modules/household/index.js';

export function HouseholdGuard({ children }) {
  const { currentHousehold, loading } = useHousehold();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: '#64748b' }}>Loading flat info...</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return <Navigate to="/household/new" replace />;
  }

  return children ? children : <Outlet />;
}
