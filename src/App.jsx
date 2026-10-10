import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/identity/index.js';
import { HouseholdProvider } from './modules/household/index.js';
import { ProtectedRoute, LoginPage, RegisterPage } from './modules/identity/index.js';
import { HouseholdSetupPage, HouseholdSettingsPage } from './modules/household/index.js';
import { ChoreListPage } from './modules/chores/index.js';
import { Layout } from './components/Layout.jsx';
import { HouseholdGuard } from './components/HouseholdGuard.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <HouseholdProvider>
          <Routes>
            {/* Public Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Household creation/join doesn't require existing household */}
                <Route path="/household/new" element={<HouseholdSetupPage />} />

                {/* Routes requiring active household */}
                <Route element={<HouseholdGuard />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/chores" element={<ChoreListPage />} />
                  <Route path="/household/settings" element={<HouseholdSettingsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HouseholdProvider>
      </AuthProvider>
    </HashRouter>
  );
}
