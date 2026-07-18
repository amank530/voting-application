import React, { useState } from 'react';
import { api } from '../../services/api';

export default function EciLoginPage({ onLoginSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.bypass('ELECTION_COMMISSION');
      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.token);
        }
      }
    } catch (err) {
      setError('ECI admin verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <span className="text-4xl">⚖️</span>
        <h2 className="mt-4 text-2xl font-bold font-display text-gray-900">ECI Official Login</h2>
        <p className="text-xs text-gray-500 mt-1">Simulated Secure Administrative Gateway</p>
        {error && <div className="mt-4 p-2 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter ECI Admin Console'}
          </button>
        </form>
      </div>
    </div>
  );
}
