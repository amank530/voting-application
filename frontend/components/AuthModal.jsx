import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { INDIAN_REGIONS } from '../services/constants';
import { 
  X, ShieldAlert, Sparkles, Check, ChevronRight, UserPlus, LogIn, ArrowLeft, 
  Camera, Lock, KeyRound, MapPin, User, Scan, Fingerprint, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'SIGNUP'
  const [signupStep, setSignupStep] = useState(1); // 1: Details, 2: Aadhaar OTP, 3: Face Auth, 4: Password
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login fields
  const [loginAadhar, setLoginAadhar] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Regional selection for signup details
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [constituency, setConstituency] = useState('');
  const [city, setCity] = useState('');
  const [isManualAddress, setIsManualAddress] = useState(false);

  // Simulated biometric scan states
  const [scanStatus, setScanStatus] = useState('READY'); // 'READY' | 'SCANNING' | 'SUCCESS' | 'FAILED'
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState('Position your face inside the circle.');

  // Formatting Aadhaar Input (XXXX XXXX XXXX)
  const formatAadhar = (val) => {
    const numbersOnly = val.replace(/\D/g, '');
    const trimmed = numbersOnly.substring(0, 12);
    const matches = trimmed.match(/\d{4}/g);
    if (matches) {
      let formatted = matches.join(' ');
      const remaining = trimmed.substring(matches.length * 4);
      if (remaining) formatted += ' ' + remaining;
      return formatted;
    }
    return trimmed;
  };

  const handleReset = () => {
    setAuthMode('LOGIN');
    setSignupStep(1);
    setLoading(false);
    setError('');
    
    setLoginAadhar('');
    setLoginPassword('');
    
    setName('');
    setAge('');
    setGender('');
    setAddress('');
    setAadharNo('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setState('');
    setDistrict('');
    setConstituency('');
    setCity('');
    setIsManualAddress(false);
    
    setScanStatus('READY');
    setScanProgress(0);
    setScanLog('Position your face inside the circle.');
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  // Handle biometric scanning simulation
  useEffect(() => {
    let timer;
    if (scanStatus === 'SCANNING') {
      setScanProgress(0);
      setScanLog('Activating camera feed & scanning landmarks...');
      
      timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setScanStatus('SUCCESS');
            setScanLog('Face matched successfully with UIDAI Biometric Vault (Score: 99.4%)');
            return 100;
          }
          
          const next = prev + 5;
          if (next === 30) setScanLog('Detecting liveness & facial pulse...');
          if (next === 60) setScanLog('Comparing depth map against Aadhaar registry...');
          if (next === 85) setScanLog('Generating secure face-hash signature...');
          
          return next;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [scanStatus]);

  if (!isOpen) return null;

  // Skip / Sandbox test bypass
  const handleBypass = async (role) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.bypass(role);
      if (res.success) {
        onLoginSuccess(res.user, res.token);
        onClose();
        handleReset();
      }
    } catch (e) {
      setError(e.message || 'Bypass login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanAadhar = loginAadhar.replace(/\s/g, '');
    if (cleanAadhar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your secure ECI password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.citizenLogin(cleanAadhar, loginPassword);
      if (res.success) {
        if (res.user.role === 'PARTY_ADMIN') {
          setError('Party Administrators must log in through the "Registered Political Parties" page admin console.');
          setLoading(false);
          return;
        }
        onLoginSuccess(res.user, res.token);
        onClose();
        handleReset();
      }
    } catch (e) {
      setError(e.message || 'Aadhaar login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Wizard Navigation
  const advanceSignupStep = () => {
    setError('');
    if (signupStep === 1) {
      // Validate step 1
      if (!name || !age || !gender || !address || !aadharNo || !state || !district || !city) {
        setError('Please fill out all personal and regional details (Name, Age, Gender, Address, Aadhaar, State, District, and City/Town).');
        return;
      }
      if (Number(age) < 18) {
        setError('Age compliance failed. You must be 18 years or older to sign up.');
        return;
      }
      if (aadharNo.replace(/\s/g, '').length !== 12) {
        setError('Aadhaar Number must be exactly 12 digits.');
        return;
      }
      setSignupStep(2);
    } else if (signupStep === 2) {
      // Validate OTP
      if (otp !== '482935') {
        setError('Invalid Aadhaar OTP. Please enter 482935.');
        return;
      }
      setSignupStep(3);
    } else if (signupStep === 3) {
      // Validate Face scan
      if (scanStatus !== 'SUCCESS') {
        setError('Please complete the biometric face scan first.');
        return;
      }
      setSignupStep(4);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.citizenSignup({
        aadharNumber: aadharNo.replace(/\s/g, ''),
        name,
        age: Number(age),
        gender,
        address,
        password,
        state,
        district,
        constituency,
        city
      });
      if (res.success) {
        onLoginSuccess(res.user, res.token);
        onClose();
        handleReset();
      }
    } catch (e) {
      setError(e.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // State calculations for details
  const districtsForState = INDIAN_REGIONS.find(r => r.state === state)?.districts || [];
  const constituenciesForDistrict = districtsForState.find(d => d.name === district)?.constituencies || [];

  return (
    <div className="fixed inset-0 bg-primary-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh]"
      >
        {/* Left decoration rail */}
        <div className="hidden md:flex bg-primary-700 text-white p-5 md:w-5/12 flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative watermark */}
          <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-y-12 translate-x-12 select-none pointer-events-none">
            <Fingerprint className="w-96 h-96" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                ECI
              </div>
              <span className="text-xs font-bold tracking-wider text-saffron-400">DEMOCRACY CORE</span>
            </div>
            
            <h2 className="text-xl font-bold font-display leading-snug">
              {authMode === 'LOGIN' ? 'National Citizen Identity Login' : 'Secure Citizen Sign-up'}
            </h2>
            
            <p className="text-[11px] text-gray-300 leading-relaxed">
              This secure administrative simulation supports Aadhaar-based cryptographic voter authentication. Experience one voter, one vote with high-fidelity biometric safeguards.
            </p>
          </div>

          {/* Steps Indicator for Signup */}
          {authMode === 'SIGNUP' && (
            <div className="space-y-2.5 relative z-10 py-4 border-y border-white/10 my-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Signup Progress</p>
              <div className="flex items-center gap-2 text-xs">
                {[
                  { num: 1, label: 'Details' },
                  { num: 2, label: 'Aadhaar OTP' },
                  { num: 3, label: 'Face Scan' },
                  { num: 4, label: 'Password' }
                ].map((s) => (
                  <div key={s.num} className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition ${
                      signupStep === s.num 
                        ? 'bg-saffron-500 text-white shadow-md' 
                        : signupStep > s.num 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {signupStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span className={`text-[8px] font-medium mt-1 ${signupStep === s.num ? 'text-saffron-400 font-bold' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] text-gray-300 space-y-1 relative z-10">
            <div className="flex items-center gap-1.5 text-saffron-500 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>UIDAI Security Policy</span>
            </div>
            <p className="leading-relaxed text-gray-400">
              By proceeding, your biometric parameters are cross-checked with the encrypted simulation vault.
            </p>
          </div>
        </div>

        {/* Right interaction column */}
        <div className="p-5 md:p-6 w-full md:w-7/12 flex flex-col justify-between overflow-y-auto max-h-[95vh] md:max-h-[90vh]">
          <div>
            {/* Header / Back */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                {authMode === 'SIGNUP' && signupStep > 1 && (
                  <button 
                    onClick={() => setSignupStep(prev => prev - 1)}
                    className="p-1 hover:bg-gray-100 text-gray-500 rounded-md transition"
                    type="button"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h3 className="font-bold text-gray-900 text-base font-display">
                  {authMode === 'LOGIN' ? 'Voter Login' : `Step ${signupStep} of 4: Signup`}
                </h3>
              </div>
              
              <button 
                onClick={() => { handleReset(); onClose(); }} 
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Steps Progress on Mobile */}
            {authMode === 'SIGNUP' && (
              <div className="md:hidden flex items-center justify-between gap-1 py-2 px-1 mb-3 border-b border-gray-100">
                {[
                  { num: 1, label: 'Details' },
                  { num: 2, label: 'Aadhaar OTP' },
                  { num: 3, label: 'Face Scan' },
                  { num: 4, label: 'Password' }
                ].map((s) => (
                  <div key={s.num} className="flex items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] transition ${
                      signupStep === s.num 
                        ? 'bg-primary-600 text-white shadow-xs' 
                        : signupStep > s.num 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {signupStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                    </div>
                    <span className={`text-[9px] font-bold ${signupStep === s.num ? 'text-primary-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* -------------------- LOGIN VIEW -------------------- */}
            {authMode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 leading-normal mb-1">
                  Enter your registered 12-digit Aadhaar number and secure password to log in.
                </p>

                {/* Aadhaar */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Aadhaar Number</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="1234 5678 9012"
                      value={loginAadhar}
                      onChange={(e) => setLoginAadhar(formatAadhar(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold tracking-wider focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type={showLoginPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading || loginAadhar.replace(/\s/g, '').length !== 12 || !loginPassword}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating UIDAI Vault...' : 'Log In securely'}
                </button>

                <div className="pt-3 border-t border-gray-100 text-center">
                  <p className="text-[11px] text-gray-500">
                    New voter?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('SIGNUP'); setSignupStep(1); }}
                      className="text-primary-600 hover:text-primary-700 font-bold underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Create ECI Profile
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* -------------------- SIGNUP WIZARD -------------------- */}
            {authMode === 'SIGNUP' && (
              <div>
                {/* STEP 1: PERSONAL & REGIONAL DETAILS */}
                {signupStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-500 leading-snug">
                      Step 1: Enter your personal credentials matching your official Aadhaar identity file.
                    </p>

                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="e.g. Aman Patel"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Aadhaar */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Aadhaar Number</label>
                      <div className="relative">
                        <Fingerprint className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          placeholder="XXXX XXXX XXXX"
                          value={aadharNo}
                          onChange={(e) => setAadharNo(formatAadhar(e.target.value))}
                          className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold tracking-wider focus:bg-white focus:outline-none"
                          maxLength={14}
                        />
                      </div>
                    </div>

                    {/* Age and Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600 uppercase">Age (Min 18)</label>
                        <input 
                          type="number" 
                          min={18}
                          placeholder="Age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600 uppercase">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Complete Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Flat/House, Street, Area"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                            {/* Toggle Address and Region Mode */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-gray-600 uppercase">Address & Region Details</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsManualAddress(!isManualAddress);
                          setState('');
                          setDistrict('');
                          setConstituency('');
                          setCity('');
                        }} 
                        className="text-[10px] text-primary-600 hover:text-primary-700 font-bold underline focus:outline-none cursor-pointer"
                      >
                        {isManualAddress ? '📋 Select from list instead' : '✍️ Write address manually instead'}
                      </button>
                    </div>

                    {!isManualAddress ? (
                      /* SELECT FROM LIST MODE */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">State</label>
                            <select
                              value={state}
                              onChange={(e) => { setState(e.target.value); setDistrict(''); setConstituency(''); }}
                              className="w-full px-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:bg-white focus:outline-none"
                            >
                              <option value="">Select State</option>
                              {INDIAN_REGIONS.map((r, idx) => (
                                <option key={idx} value={r.state}>{r.state}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">District</label>
                            <select
                              disabled={!state}
                              value={district}
                              onChange={(e) => { setDistrict(e.target.value); setConstituency(''); }}
                              className="w-full px-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:bg-white focus:outline-none disabled:opacity-50"
                            >
                              <option value="">Select District</option>
                              {districtsForState.map((d, idx) => (
                                <option key={idx} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">City / Town</label>
                            <input
                              type="text"
                              placeholder="e.g. Bhopal"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">Constituency (Optional)</label>
                            <select
                              disabled={!district}
                              value={constituency}
                              onChange={(e) => setConstituency(e.target.value)}
                              className="w-full px-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:bg-white focus:outline-none disabled:opacity-50"
                            >
                              <option value="">Select Seat</option>
                              {constituenciesForDistrict.map((c, idx) => (
                                <option key={idx} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* WRITE MANUALLY MODE */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">State</label>
                            <input
                              type="text"
                              placeholder="e.g. Madhya Pradesh"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">District</label>
                            <input
                              type="text"
                              placeholder="e.g. Bhopal"
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">City / Town</label>
                            <input
                              type="text"
                              placeholder="e.g. Bhopal"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-600 uppercase">Constituency (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Bhopal North"
                              value={constituency}
                              onChange={(e) => setConstituency(e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}              </div>

                    <button
                      type="button"
                      onClick={advanceSignupStep}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer mt-2"
                    >
                      Proceed to OTP Verification <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: AADHAAR OTP VERIFICATION */}
                {signupStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 space-y-1 flex items-start gap-2.5">
                      <div className="p-1 bg-emerald-100 text-emerald-700 rounded-full h-fit mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block">Aadhaar Vault OTP Dispatched!</span>
                        <span>Use the secure simulated OTP <strong className="font-bold underline text-emerald-950">482935</strong> sent to +91 XXXXX XX345.</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">Enter Aadhaar OTP</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 482935"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 tracking-widest font-bold text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={advanceSignupStep}
                      disabled={otp.length !== 6}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      Verify OTP Credentials <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 3: BIOMETRIC FACE AUTHENTICATION */}
                {signupStep === 3 && (
                  <div className="space-y-4 text-center">
                    <p className="text-[11px] text-gray-500 text-left">
                      Step 3: UIDAI FaceRD biometric scan ensures correct liveness check matching your Aadhaar profile photo.
                    </p>

                    {/* Scanner interface */}
                    <div className="relative w-44 h-44 mx-auto rounded-full border-4 border-gray-100 bg-gray-950 flex items-center justify-center overflow-hidden group shadow-inner">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                      {/* Silhouette */}
                      <User className={`w-24 h-24 transition ${
                        scanStatus === 'SUCCESS' ? 'text-emerald-500/80' : 'text-gray-600'
                      }`} />

                      {/* Scan lines */}
                      {scanStatus === 'SCANNING' && (
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2s_infinite] pointer-events-none"></div>
                      )}

                      {/* Scanner HUD Overlay */}
                      <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-[ping_3s_infinite] pointer-events-none"></div>

                      {/* Success watermark */}
                      {scanStatus === 'SUCCESS' && (
                        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-3xs flex flex-col items-center justify-center text-emerald-400 animate-fade-in">
                          <Check className="w-10 h-10 border-2 border-emerald-400 rounded-full p-1 bg-emerald-900/80" />
                          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider bg-emerald-900/80 px-2 py-0.5 rounded">AUTHENTICATED</span>
                        </div>
                      )}
                    </div>

                    {/* Log status text */}
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl max-w-sm mx-auto text-[10px] font-mono text-gray-600 min-h-[44px] flex items-center justify-center">
                      {scanLog}
                    </div>

                    {scanStatus === 'SCANNING' && (
                      <div className="max-w-xs mx-auto space-y-1">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${scanProgress}%` }}></div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono block">Scanning... {scanProgress}%</span>
                      </div>
                    )}

                    <div className="flex gap-2.5 max-w-sm mx-auto">
                      {scanStatus !== 'SUCCESS' ? (
                        <button
                          type="button"
                          onClick={() => setScanStatus('SCANNING')}
                          disabled={scanStatus === 'SCANNING'}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <Camera className="w-4 h-4" />
                          {scanStatus === 'SCANNING' ? 'Scanning Facial Landmarks...' : 'Begin FaceRD Scan'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={advanceSignupStep}
                          className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          Proceed to Password Setup <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: SET PASSWORD */}
                {signupStep === 4 && (
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <p className="text-[11px] text-gray-500 leading-snug">
                      Step 4: Establish a secure access password for subsequent logins on the ECI digital portal.
                    </p>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Set Portal Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type={showPass ? "text" : "password"} 
                          placeholder="Min 4 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type={showPass ? "text" : "password"} 
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || password.length < 4 || password !== confirmPassword}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {loading ? 'Creating secure citizen file...' : 'Complete Registration & Login'}
                    </button>
                  </form>
                )}

                <div className="text-center pt-3 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('LOGIN'); }}
                    className="text-[11px] text-gray-400 hover:text-gray-600 underline"
                  >
                    Already have an ECI profile? Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
