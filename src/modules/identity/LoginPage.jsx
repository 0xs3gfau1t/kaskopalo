import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithGoogle, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Log in to Kaskopalo</h2>
      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { clearError(); setEmail(e.target.value); }}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => { clearError(); setPassword(e.target.value); }}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <button
        onClick={async () => {
          try {
            await loginWithGoogle();
            navigate('/');
          } catch {}
        }}
        disabled={submitting}
        style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      >
        Sign in with Google
      </button>
      <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Don't have an account? <Link to="/register" style={{ color: '#3b82f6' }}>Register</Link>
      </p>
    </div>
  );
}
