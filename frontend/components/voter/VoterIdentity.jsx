import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function VoterIdentity({ currentUser }) {
  const [identityProof, setIdentityProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  
  const [idStatus, setIdStatus] = useState('VERIFIED'); // 'EMPTY' | 'PENDING' | 'VERIFIED'
  const [addrStatus, setAddrStatus] = useState('VERIFIED'); // 'EMPTY' | 'PENDING' | 'VERIFIED'
  
  const [message, setMessage] = useState('');
  const [dragActiveId, setDragActiveId] = useState(false);
  const [dragActiveAddr, setDragActiveAddr] = useState(false);

  const handleMockUpload = (type, filename) => {
    setMessage('');
    if (type === 'identity') {
      setIdentityProof(filename);
      setIdStatus('PENDING');
      setTimeout(() => {
        setIdStatus('VERIFIED');
        setMessage('Identity Proof (Aadhaar Scan) verified against UIDAI Biometric registry!');
      }, 2000);
    } else {
      setAddressProof(filename);
      setAddrStatus('PENDING');
      setTimeout(() => {
        setAddrStatus('VERIFIED');
        setMessage('Address Proof successfully matched with State Land records!');
      }, 2500);
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

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      <div className="border-b border-gray-50 pb-3">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          Identity Proof Verification Portal
        </h3>
        <p className="text-[10px] text-gray-400 leading-normal mt-1">
          To maintain high-fidelity election registers, verify your official Aadhaar and address dossiers. Submissions are cryptographically cross-verified within 2.5 seconds in this simulated environment.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-800 font-medium">
          ✓ {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Identity Card (Aadhaar / Passport / Voter ID) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 block">1. Government Identity Proof</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
              idStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              idStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
              'bg-gray-50 text-gray-400 border border-gray-200'
            }`}>
              {idStatus === 'VERIFIED' ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
              {idStatus}
            </span>
          </div>

          <div 
            onDragEnter={(e) => handleDrag(e, setDragActiveId)}
            onDragOver={(e) => handleDrag(e, setDragActiveId)}
            onDragLeave={(e) => handleDrag(e, setDragActiveId)}
            onDrop={(e) => handleDrop(e, 'identity', setDragActiveId, 'aadhaar_front_back_scan.pdf')}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center min-h-[160px] ${
              dragActiveId ? 'border-primary-500 bg-primary-50/25' :
              idStatus === 'VERIFIED' ? 'border-emerald-200 bg-emerald-50/10' :
              'border-gray-200 bg-gray-50/50 hover:bg-white'
            }`}
          >
            {idStatus === 'VERIFIED' ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Aadhaar Document Loaded</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{identityProof || 'aadhaar_ref_verified.jpg'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleMockUpload('identity', 'new_aadhaar_scan.pdf')}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 rounded shadow-3xs cursor-pointer"
                >
                  Replace Document
                </button>
              </div>
            ) : idStatus === 'PENDING' ? (
              <div className="space-y-2">
                <Clock className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-amber-800">Scanning UIDAI Landmarks...</p>
                <p className="text-[10px] text-gray-400">Verifying liveness face map hashes</p>
              </div>
            ) : (
              <div className="space-y-2 select-none">
                <Upload className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">Drag & Drop or Click to Upload</p>
                <p className="text-[10px] text-gray-400">PDF, JPG, PNG up to 5MB (Aadhaar or Passport)</p>
                <button
                  type="button"
                  onClick={() => handleMockUpload('identity', 'national_id_card.pdf')}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded font-bold text-[10px] cursor-pointer mt-1"
                >
                  Upload Simulated ID
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Module 2: Address Proof (Electricity bill, rental agreement, utility) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 block">2. Address verification proof</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
              addrStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              addrStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
              'bg-gray-50 text-gray-400 border border-gray-200'
            }`}>
              {addrStatus === 'VERIFIED' ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
              {addrStatus}
            </span>
          </div>

          <div 
            onDragEnter={(e) => handleDrag(e, setDragActiveAddr)}
            onDragOver={(e) => handleDrag(e, setDragActiveAddr)}
            onDragLeave={(e) => handleDrag(e, setDragActiveAddr)}
            onDrop={(e) => handleDrop(e, 'address', setDragActiveAddr, 'utility_electricity_bill.pdf')}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center min-h-[160px] ${
              dragActiveAddr ? 'border-primary-500 bg-primary-50/25' :
              addrStatus === 'VERIFIED' ? 'border-emerald-200 bg-emerald-50/10' :
              'border-gray-200 bg-gray-50/50 hover:bg-white'
            }`}
          >
            {addrStatus === 'VERIFIED' ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Physical Address Registered</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{addressProof || 'utility_bill_sim_verified.pdf'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleMockUpload('address', 'new_utility_bill.pdf')}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 rounded shadow-3xs cursor-pointer"
                >
                  Replace Document
                </button>
              </div>
            ) : addrStatus === 'PENDING' ? (
              <div className="space-y-2">
                <Clock className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-amber-800">Validating Land Registry Seals...</p>
                <p className="text-[10px] text-gray-400">Checking physical mapping parameters</p>
              </div>
            ) : (
              <div className="space-y-2 select-none">
                <Upload className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">Drag & Drop or Click to Upload</p>
                <p className="text-[10px] text-gray-400">Electricity Bill, Gas Bill, or Rent Agreement</p>
                <button
                  type="button"
                  onClick={() => handleMockUpload('address', 'utility_bill.pdf')}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded font-bold text-[10px] cursor-pointer mt-1"
                >
                  Upload Address bill
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2 text-[10px] text-blue-800 font-medium">
        <AlertTriangle className="w-4 h-4 text-blue-700 shrink-0" />
        <p className="leading-snug">
          <strong>Identity Note:</strong> The documents are cross-matched automatically with your registered profile parameters: <strong>{currentUser.name}</strong>, residing at <strong>{currentUser.address || 'Bhopal'}</strong>. Any discrepancy will flag the profile for manual review in the Election Commission Dashboard.
        </p>
      </div>
    </div>
  );
}
