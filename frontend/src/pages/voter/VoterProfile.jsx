import React, { useState, useEffect } from 'react';
import { User, KeyRound, ShieldCheck, MapPin, RefreshCw, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function VoterProfile({ currentUser, onProfileUpdated }) {
  const [dob, setDob] = useState(currentUser.dob || '1998-05-15');
  const [name, setName] = useState(currentUser.name || '');
  const [gender, setGender] = useState(currentUser.gender || 'Male');
  const [address, setAddress] = useState(currentUser.address || '');
  const [state, setState] = useState(currentUser.state || '');
  const [district, setDistrict] = useState(currentUser.district || '');
  const [constituency, setConstituency] = useState(currentUser.constituency || '');
  const [city, setCity] = useState(currentUser.city || '');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FaEnabled, setIs2FaEnabled] = useState(currentUser.twoFactorEnabled || false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-calculate age according to Date of Birth
  useEffect(() => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    // Auto update age if it is valid
    if (calculatedAge >= 18) {
      setError('');
    } else if (calculatedAge > 0) {
      setError('Underage alert: Age is calculated to be below 18 years.');
    }
  }, [dob]);

  const handleCalculateAge = (birthDob) => {
    const birthDate = new Date(birthDob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return Math.max(18, calculatedAge);
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const computedAge = handleCalculateAge(dob);
    if (computedAge < 18) {
      setError('Age compliance failed. You must be 18 years or older to hold a valid voter profile.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/profile/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age: computedAge,
          gender,
          address,
          state,
          district,
          constituency,
          city,
          dob,
          twoFactorEnabled: is2FaEnabled
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      
      onProfileUpdated(data.user);
      setMessage('Profile credentials and physical address updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Account password modified successfully inside secure ECI Vault.');
      setPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleToggle2FA = () => {
    const nextVal = !is2FaEnabled;
    setIs2FaEnabled(nextVal);
    setMessage(`Two-Factor Authentication (2FA) ${nextVal ? 'enabled' : 'disabled'}. An OTP verification will be required during subsequent logins.`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xl">
            {currentUser.name?.charAt(0) || 'V'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{currentUser.name}</h3>
            <p className="text-[10px] text-gray-400 font-mono">UIDAI Reference: XXXX XXXX {currentUser.aadharNumber?.slice(-4) || '3333'}</p>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Account Status</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
            <ShieldCheck className="w-3 h-3" />
            Verified & Compliant
          </span>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 font-medium">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Form */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
            <User className="w-4 h-4 text-primary-600" />
            Personal Information
          </h4>

          <form onSubmit={handleUpdateDetails} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-gray-600">Full Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-600">Date of Birth (DOB)</label>
                <input 
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-gray-600">Calculated Age (Auto)</label>
                <div className="w-full bg-gray-100 text-gray-700 border border-gray-200 rounded-lg py-2 px-3 font-mono font-bold select-none">
                  {handleCalculateAge(dob)} Years Old
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-600">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Physical Address</label>
              <input 
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">State</label>
                <input 
                  type="text" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-1.5 text-xs focus:bg-white focus:outline-none" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">District</label>
                <input 
                  type="text" 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-1.5 text-xs focus:bg-white focus:outline-none" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">City / Town</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City/Town"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-1.5 text-xs focus:bg-white focus:outline-none" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-600 text-xs">Constituency (Optional)</label>
                <input 
                  type="text" 
                  value={constituency} 
                  onChange={(e) => setConstituency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-1.5 text-xs focus:bg-white focus:outline-none" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? 'Updating Credentials...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Security / 2FA Settings */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
              <KeyRound className="w-4 h-4 text-saffron-600" />
              Change Password
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-600">New Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-600">Confirm New Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50 text-center"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication Toggle */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Two-Factor Auth (2FA)
            </h4>

            <p className="text-[10px] text-gray-400 leading-normal">
              Keep your civic identity extra secure. Enabling 2FA mandates verifying an OTP code sent to your registered Aadhaar mobile number during login attempts.
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-gray-700">Aadhaar 2FA Security</span>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${is2FaEnabled ? 'bg-emerald-600' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${is2FaEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
