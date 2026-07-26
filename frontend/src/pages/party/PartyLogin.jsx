import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldCheck, Key, Building2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PartyLogin({ 
  onLogin, 
  onCancel, 
  onNavigateToRegister,
  parties = [] 
}) {
  const [loginAbbrev, setLoginAbbrev] = useState('');
  const [loginPassword, setLoginPassword] = useState('password');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const approvedParties = parties.length > 0 
    ? parties.filter(p => p.status === 'APPROVED')
    : [
        { abbrev: 'BJP', name: 'Bharatiya Janata Party', symbol: '🪷' },
        { abbrev: 'INC', name: 'Indian National Congress', symbol: '✋' },
        { abbrev: 'AAP', name: 'Aam Aadmi Party', symbol: '🧹' },
        { abbrev: 'SP', name: 'Samajwadi Party', symbol: '🚲' },
        { abbrev: 'SS', name: 'Shiv Sena', symbol: '🏹' }
      ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginAbbrev.trim()) {
      setLoginError('Please enter a party abbreviation.');
      return;
    }

    try {
      setSubmitting(true);
      setLoginError('');
      if (onLogin) {
        await onLogin({ abbrev: loginAbbrev.trim().toUpperCase(), password: loginPassword });
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please verify party credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSelect = (abbrev) => {
    setLoginAbbrev(abbrev);
    setLoginPassword('password');
    setLoginError('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto border border-purple-100 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 font-display">Party Secretariat Access Portal</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-normal">
            Enter ECI authorized political party abbreviation and passkey to access High Command secretariat operations.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
            <span>⚠️</span> <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">
              Party Abbreviation (e.g. BJP, INC)
            </label>
            <input 
              type="text" 
              placeholder="e.g. BJP"
              value={loginAbbrev}
              onChange={(e) => setLoginAbbrev(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">
              Security Passkey
            </label>
            <input 
              type="password" 
              placeholder="Enter security password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Verifying Credentials...' : 'Authenticate Secretariat Session'}
          </button>
        </form>

        {/* Quick Demo Party Selection */}
        <div className="pt-4 border-t border-gray-100 text-left space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Quick Select Approved Parties (Default Passkey: password)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {approvedParties.map((p) => (
              <button
                key={p.abbrev}
                type="button"
                onClick={() => handleQuickSelect(p.abbrev)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  loginAbbrev === p.abbrev 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span>{p.symbol || '🏛️'}</span>
                <span>{p.abbrev}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="pt-2 flex items-center justify-between text-xs">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Registry
            </button>
          )}
          {onNavigateToRegister && (
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
            >
              Apply for New Party Registration →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
