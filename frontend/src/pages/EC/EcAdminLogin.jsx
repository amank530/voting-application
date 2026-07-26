import React, { useState } from 'react';
import { api } from '../../services/api';
import { Lock, User, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function EcAdminLogin({ onLoginSuccess, onNavigateToHome }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.auth.ecAdminLogin(username, password);
      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.token);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-150 shadow-2xl relative"
      >
        <button
          onClick={onNavigateToHome}
          className="absolute left-6 top-6 p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition cursor-pointer"
          title="Back to National Portal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 pt-6">
          <div className="w-16 h-16 bg-primary-50 text-primary-800 rounded-full flex items-center justify-center mx-auto border-2 border-primary-200 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-950 font-display">ECI Commissioner Console</h2>
            <p className="text-xs text-gray-400 mt-1">
              Authorized ECI administrative portal. Access restricted to security clearance level 1 commissioners.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-semibold rounded-xl animate-shake">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Administrative Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Commissioner Passkey
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
                  placeholder="Enter admin password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-primary-800/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Decrypting tokens...</span>
              </>
            ) : (
              <span>Authenticate and access</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-gray-400 leading-normal">
            For audit sandbox, defaults are: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-800">admin</code> & <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-800">admin123</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
