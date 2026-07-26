import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, ShieldCheck, AlertTriangle, Smartphone, Mail, RefreshCw, KeyRound } from 'lucide-react';

export default function VoterIdentity({ currentUser }) {
  // Verification states
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '9876543210');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(true);

  const [email, setEmail] = useState(currentUser?.email || 'voter@eci.gov.in');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  const [identityProof, setIdentityProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [idStatus, setIdStatus] = useState('VERIFIED'); // 'EMPTY' | 'PENDING' | 'VERIFIED'
  const [addrStatus, setAddrStatus] = useState('VERIFIED'); // 'EMPTY' | 'PENDING' | 'VERIFIED'
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dragActiveId, setDragActiveId] = useState(false);
  const [dragActiveAddr, setDragActiveAddr] = useState(false);

  // Mobile OTP Handlers
  const handleSendMobileOtp = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setMobileOtpSent(true);
    setMessage(`Verification OTP sent to +91-${mobileNumber}. (Simulated OTP: 123456)`);
  };

  const handleVerifyMobileOtp = () => {
    if (mobileOtp === '123456' || mobileOtp.length === 6) {
      setMobileVerified(true);
      setMobileOtpSent(false);
      setMessage('Mobile number verified successfully via ECI OTP Gateway!');
      setError('');
    } else {
      setError('Invalid Mobile OTP. Enter 123456 for instant verification.');
    }
  };

  // Email OTP Handlers
  const handleSendEmailOtp = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setEmailOtpSent(true);
    setMessage(`Verification OTP dispatched to ${email}. (Simulated OTP: 654321)`);
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp === '654321' || emailOtp.length === 6) {
      setEmailVerified(true);
      setEmailOtpSent(false);
      setMessage('Email address verified successfully!');
      setError('');
    } else {
      setError('Invalid Email OTP. Enter 654321 for instant verification.');
    }
  };

  const handleMockUpload = (type, filename) => {
    setMessage('');
    setError('');
    if (type === 'identity') {
      setIdentityProof(filename);
      setIdStatus('PENDING');
      setTimeout(() => {
        setIdStatus('VERIFIED');
        setMessage('Identity Proof (Aadhaar/Passport) verified against UIDAI Biometric database!');
      }, 1800);
    } else {
      setAddressProof(filename);
      setAddrStatus('PENDING');
      setTimeout(() => {
        setAddrStatus('VERIFIED');
        setMessage('Address Proof matched successfully with State Land & Revenue records!');
      }, 2000);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e, setDrag) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDrag(true);
    } else if (e.type === "dragleave") {
      setDrag(false);
    }
  };

  const handleDrop = (e, type, setDrag, filename) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMockUpload(type, e.dataTransfer.files[0].name);
    } else {
      handleMockUpload(type, filename);
    }
  };

  // Calculate Overall Verification Progress Score
  const stepsCompleted = [mobileVerified, emailVerified, idStatus === 'VERIFIED', addrStatus === 'VERIFIED'].filter(Boolean).length;
  const progressPercent = Math.round((stepsCompleted / 4) * 100);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Tracker Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-950 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-saffron-500/20 rounded-xl border border-saffron-400/30">
              <ShieldCheck className="w-6 h-6 text-saffron-400" />
            </div>
            <div>
              <span className="text-[10px] text-saffron-400 font-extrabold uppercase tracking-widest block">ECI Citizen Verification Protocol</span>
              <h2 className="text-base font-black text-white">Voter Identity Verification & Dossier Portal</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-gray-200">Overall Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
              progressPercent === 100 
                ? 'bg-emerald-500 text-white' 
                : 'bg-saffron-500 text-white'
            }`}>
              {progressPercent === 100 ? 'Fully Certified (100%)' : `In Progress (${progressPercent}%)`}
            </span>
          </div>
        </div>

        {/* Verification Pipeline Step Indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${mobileVerified ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>
            <Smartphone className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-bold text-[11px]">1. Mobile OTP</p>
              <p className="text-[9px] opacity-80">{mobileVerified ? '✓ Verified' : 'Action Required'}</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${emailVerified ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>
            <Mail className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-bold text-[11px]">2. Email OTP</p>
              <p className="text-[9px] opacity-80">{emailVerified ? '✓ Verified' : 'Action Required'}</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${idStatus === 'VERIFIED' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>
            <FileText className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-bold text-[11px]">3. Identity Proof</p>
              <p className="text-[9px] opacity-80">{idStatus === 'VERIFIED' ? '✓ Aadhaar Verified' : idStatus}</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${addrStatus === 'VERIFIED' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>
            <Upload className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-bold text-[11px]">4. Address Proof</p>
              <p className="text-[9px] opacity-80">{addrStatus === 'VERIFIED' ? '✓ Land Record Verified' : addrStatus}</p>
            </div>
          </div>
        </div>

        {/* Identity Profile Status - Assembly Constituency Seat Jurisdiction */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white/5 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-saffron-400 animate-ping"></span>
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Registered Assembly Constituency Seat:</span>
            <span className="text-xs font-black text-saffron-300 bg-saffron-950/60 px-2.5 py-0.5 rounded-md border border-saffron-500/30">
              📍 {currentUser?.constituency || 'Bhopal North'}
            </span>
          </div>
          <span className="text-[10px] text-gray-300 font-mono">
            State: {currentUser?.state || 'Madhya Pradesh'} | District: {currentUser?.district || 'Bhopal'}
          </span>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: OTP Verifications & Document Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contact OTP Verification Section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-2.5">
            <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary-700" />
              Direct OTP Communication Verification
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Verify your mobile number and email address to receive immediate election alerts and polling passcodes.
            </p>
          </div>

          {/* 1. Mobile OTP Box */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-primary-600" />
                Mobile Number Verification
              </label>
              {mobileVerified ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold uppercase">
                  Pending
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setMobileVerified(false);
                }}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="10-digit Mobile Number"
              />
              <button
                type="button"
                onClick={handleSendMobileOtp}
                className="px-3.5 py-2 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
              >
                {mobileOtpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {mobileOtpSent && !mobileVerified && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-900 block">Enter 6-Digit OTP (Use: 123456):</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="w-32 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-center tracking-widest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyMobileOtp}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Email OTP Box */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary-600" />
                Email Address Verification
              </label>
              {emailVerified ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-bold uppercase">
                  Pending
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailVerified(false);
                }}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="voter@example.com"
              />
              <button
                type="button"
                onClick={handleSendEmailOtp}
                className="px-3.5 py-2 bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
              >
                {emailOtpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {emailOtpSent && !emailVerified && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-900 block">Enter Email Verification OTP (Use: 654321):</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    maxLength={6}
                    placeholder="654321"
                    className="w-32 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-center tracking-widest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Verify Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Identity & Address Proof Upload Section */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-2.5">
            <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-saffron-600" />
              Document Upload & Verification Status
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Upload official government identity and physical address proof for cryptographic verification.
            </p>
          </div>

          {/* Identity Proof Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">1. Identity Proof (Aadhaar / Passport)</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                idStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                idStatus === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                'bg-gray-100 text-gray-500'
              }`}>
                {idStatus === 'VERIFIED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {idStatus}
              </span>
            </div>

            <div 
              onDragEnter={(e) => handleDrag(e, setDragActiveId)}
              onDragOver={(e) => handleDrag(e, setDragActiveId)}
              onDragLeave={(e) => handleDrag(e, setDragActiveId)}
              onDrop={(e) => handleDrop(e, 'identity', setDragActiveId, 'aadhaar_card_scan.pdf')}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center min-h-[110px] ${
                dragActiveId ? 'border-primary-500 bg-primary-50/25' :
                idStatus === 'VERIFIED' ? 'border-emerald-300 bg-emerald-50/20' :
                'border-gray-200 bg-gray-50/50 hover:bg-white'
              }`}
            >
              {idStatus === 'VERIFIED' ? (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2 text-left">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">Aadhaar Card Registered</p>
                      <p className="text-[10px] text-gray-500 font-mono">{identityProof || 'aadhaar_biometric_verified.pdf'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMockUpload('identity', 'updated_aadhaar.pdf')}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-[10px] font-bold text-gray-700 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Re-upload
                  </button>
                </div>
              ) : idStatus === 'PENDING' ? (
                <div className="space-y-1">
                  <Clock className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-amber-900">Validating UIDAI Hashes...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800">Drag & Drop or Click to Upload Aadhaar</p>
                  <button
                    type="button"
                    onClick={() => handleMockUpload('identity', 'aadhaar_card_doc.pdf')}
                    className="px-3 py-1 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold text-[10px] cursor-pointer mt-1"
                  >
                    Select ID File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Address Proof Box */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">2. Address Proof (Utility / Land Record)</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                addrStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                addrStatus === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                'bg-gray-100 text-gray-500'
              }`}>
                {addrStatus === 'VERIFIED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {addrStatus}
              </span>
            </div>

            <div 
              onDragEnter={(e) => handleDrag(e, setDragActiveAddr)}
              onDragOver={(e) => handleDrag(e, setDragActiveAddr)}
              onDragLeave={(e) => handleDrag(e, setDragActiveAddr)}
              onDrop={(e) => handleDrop(e, 'address', setDragActiveAddr, 'electricity_utility_bill.pdf')}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center min-h-[110px] ${
                dragActiveAddr ? 'border-primary-500 bg-primary-50/25' :
                addrStatus === 'VERIFIED' ? 'border-emerald-300 bg-emerald-50/20' :
                'border-gray-200 bg-gray-50/50 hover:bg-white'
              }`}
            >
              {addrStatus === 'VERIFIED' ? (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2 text-left">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">Utility Bill / Address Approved</p>
                      <p className="text-[10px] text-gray-500 font-mono">{addressProof || 'utility_bill_verified.pdf'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMockUpload('address', 'updated_utility.pdf')}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-[10px] font-bold text-gray-700 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Re-upload
                  </button>
                </div>
              ) : addrStatus === 'PENDING' ? (
                <div className="space-y-1">
                  <Clock className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-amber-900">Validating Land Records...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800">Drag & Drop or Click to Upload Bill</p>
                  <button
                    type="button"
                    onClick={() => handleMockUpload('address', 'utility_bill_doc.pdf')}
                    className="px-3 py-1 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold text-[10px] cursor-pointer mt-1"
                  >
                    Select Address File
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-2.5 text-xs text-blue-950 font-medium">
        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>ECI Security Notice:</strong> All voter identity credentials and uploaded dossiers are locked under 256-bit ECI encryption. Your verified profile permits seamless online casting of votes and candidate nominations across your registered constituency.
        </p>
      </div>

    </div>
  );
}

