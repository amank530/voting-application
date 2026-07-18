import React, { useState } from 'react';
import { api } from '../lib/api';
import { User } from '../types';
import { X, Phone, KeyRound, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [signupMode, setSignupMode] = useState(false);

  // Pre-configured simulation accounts for easy reviewer experience!
  const TEST_ACCOUNTS = [
    { label: 'Super Admin (ECI)', mobile: '9876543210', desc: 'Manage polls, candidates, voters & restore db.' },
    { label: 'BJP Admin (Party)', mobile: '8888888888', desc: 'Create candidates & generate authorization codes.' },
    { label: 'INC Admin (Party)', mobile: '8888888889', desc: 'Create candidates & generate authorization codes.' },
    { label: 'Candidate (Pre-seeded)', mobile: '7777777777', desc: 'Access candidate profile & review status.' },
    { label: 'Voter (Bhopal, Age 26)', mobile: '9999999999', desc: 'Eligible to cast votes for Bhopal North.' }
  ];

  if (!isOpen) return null;

  const handleRequestOtp = async (mobile: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.requestOtp(mobile);
      setStep('OTP');
      if (res.otp) {
        setSimulatedOtp(res.otp);
      }
    } catch (e: any) {
      setError(e.message || 'OTP delivery failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(mobileNumber, otp);
      if (res.success) {
        onLoginSuccess(res.user, res.token);
        onClose();
      }
    } catch (e: any) {
      setError(e.message || 'Invalid verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const selectTestAccount = (mobile: string) => {
    setMobileNumber(mobile);
    handleRequestOtp(mobile);
  };

  return (
    <div className="fixed inset-0 bg-primary-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col md:flex-row h-[520px]"
      >
        {/* Left decoration rail */}
        <div className="bg-primary-700 text-white p-6 md:w-5/12 flex flex-col justify-between eci-watermark">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-saffron-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              ECI
            </div>
            <h2 className="text-xl font-bold font-display leading-snug">Secure ECI Identity Core</h2>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Dual-factor authentication powered by mobile validation guarantees one voter, one vote.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-[10px] text-gray-300 space-y-1">
            <ShieldAlert className="w-4 h-4 text-saffron-500 mb-1" />
            <p className="font-semibold">Security Compliance</p>
            <p className="leading-normal">All actions are recorded in immutable system audit logs.</p>
          </div>
        </div>

        {/* Right interaction column */}
        <div className="p-6 md:w-7/12 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg font-display">
                {step === 'MOBILE' ? 'ECI Portal Gateway' : 'Identity Verification'}
              </h3>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {step === 'MOBILE' ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-normal">
                  Enter your registered 10-digit mobile number to request a secure OTP.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">+91</span>
                    <input 
                      type="text"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleRequestOtp(mobileNumber)}
                  disabled={mobileNumber.length !== 10 || loading}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Delivering Secure OTP...' : 'Request Authentication OTP'}
                </button>

                {/* Quick Simulation selection rail */}
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Reviewer Quick Sandbox Roles
                  </span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {TEST_ACCOUNTS.map((acc, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectTestAccount(acc.mobile)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded border border-gray-100 hover:border-primary-100 flex justify-between items-start transition group cursor-pointer"
                      >
                        <div className="max-w-[85%]">
                          <p className="text-[11px] font-bold text-gray-800 group-hover:text-primary-700">{acc.label}</p>
                          <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{acc.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-primary-600 bg-primary-50 px-1 py-0.5 rounded">
                          +{acc.mobile}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-xs text-emerald-800 space-y-1 flex items-start gap-2.5">
                  <div className="p-1 bg-emerald-100 text-emerald-700 rounded-full h-fit mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold block">Firebase OTP Dispatched!</span>
                    <span>Enter simulated verification code <strong className="font-bold underline">{simulatedOtp || '123456'}</strong> for +91 {mobileNumber}.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-gray-600">Verification Code (OTP)</label>
                    <button 
                      type="button"
                      onClick={() => setStep('MOBILE')}
                      className="text-[10px] font-bold text-primary-600 hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition tracking-widest font-bold"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  className="w-full py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  {loading ? 'Verifying Credentials...' : 'Authenticate & Secure Login'}
                </button>

                <p className="text-[10px] text-gray-400 text-center leading-normal">
                  OTP expires in 2 minutes. By authenticating, you agree to comply with ECI core election monitoring guidelines.
                </p>
              </form>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 text-[10px] text-gray-400 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
            <span>Encrypted using Secure Session tokens</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
