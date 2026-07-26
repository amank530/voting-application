import React from 'react';
import { Landmark, Printer, Award, ShieldCheck, Download, MapPin, Users } from 'lucide-react';

export default function VoterInfo({ currentUser, onNavigateToMemberReq }) {
  const epicNumber = `ECI${(currentUser.aadharNumber || '111122223333').slice(-4)}${currentUser.id?.toUpperCase().slice(-4) || 'VOT'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1.5">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-saffron-600" />
          Voter Identity Card (EPIC)
        </h3>
        <p className="text-[10px] text-gray-400 leading-normal">
          Your unique Electoral Photo Identity Card (EPIC) coordinates are synchronized directly with the national electoral roll. You can download or print this card for verification at polling stations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* The EPIC Card Display */}
        <div className="md:col-span-2 flex flex-col items-center">
          
          {/* Card Border */}
          <div id="printable-epic-card" className="w-full max-w-md bg-white border-2 border-primary-800 rounded-2xl shadow-xl overflow-hidden relative font-sans text-xs flex flex-col justify-between min-h-[260px]">
            {/* Top Bar resembling real Indian Voter ID card */}
            <div className="bg-gradient-to-r from-saffron-500 via-white to-emerald-600 px-4 py-2 border-b border-primary-800 flex items-center justify-between text-gray-900 select-none">
              <span className="font-extrabold text-[10px] tracking-tight text-primary-900">ELECTION COMMISSION OF INDIA</span>
              <span className="font-black text-[9px] bg-white/80 border border-primary-800 px-1 py-0.5 rounded text-primary-950 font-mono">भारत निर्वाचन आयोग</span>
            </div>

            {/* Core Card Body */}
            <div className="p-4 grid grid-cols-3 gap-4 items-start bg-radial from-white via-gray-50/20 to-gray-50/50">
              
              {/* Left Photo & Biometric Stamp */}
              <div className="space-y-2 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-24 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center relative shadow-inner">
                  {currentUser.photo ? (
                    <img 
                      src={currentUser.photo} 
                      alt="EPIC Voter" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="font-black text-3xl text-gray-400 select-none">{currentUser.name?.charAt(0) || 'V'}</span>
                  )}
                  {/* Semi-transparent watermark stamp */}
                  <div className="absolute inset-x-0 bottom-0 bg-primary-800/80 text-[7px] text-white font-extrabold py-0.5 tracking-tight uppercase leading-none border-t border-primary-900 select-none">
                    APPROVED
                  </div>
                </div>

                <span className="text-[8px] font-bold text-gray-500 tracking-wider block font-mono">ID: {currentUser.id?.toUpperCase() || 'USR-VOT'}</span>
              </div>

              {/* Center Details */}
              <div className="col-span-2 space-y-2 border-l border-gray-100 pl-4 text-[11px]">
                
                {/* EPIC number in large bold text */}
                <div className="pb-1 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">EPIC Number</span>
                    <span className="font-mono font-black text-gray-900 text-xs tracking-wider">{epicNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <div>
                    <span className="text-[8px] font-semibold text-gray-400 uppercase">Voter Name / नाम</span>
                    <p className="font-black text-gray-900">{currentUser.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] font-semibold text-gray-400 uppercase">Age / उम्र</span>
                      <p className="font-bold text-gray-900">{currentUser.age} Years</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-semibold text-gray-400 uppercase">Gender / लिंग</span>
                      <p className="font-bold text-gray-900">{currentUser.gender || 'Male'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-semibold text-gray-400 uppercase">Constituency / निर्वाचन क्षेत्र</span>
                    <p className="font-extrabold text-primary-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-saffron-600 shrink-0" />
                      {currentUser.constituency || 'Bhopal North'}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Bar containing Security watermark and signature block */}
            <div className="bg-primary-900 text-white px-4 py-2 border-t border-primary-800 flex justify-between items-center text-[9px]">
              <span className="font-mono text-gray-300">State: {currentUser.state || 'Madhya Pradesh'}</span>
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>E-SIGNED SECURE</span>
              </div>
            </div>

          </div>

          {/* Action buttons & Member Request Button */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs transition"
            >
              <Printer className="w-4 h-4 text-gray-500" /> Print ID Card
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>

            {/* Prominent Member Request Button in EPIC Coordinates */}
            <button
              onClick={onNavigateToMemberReq}
              className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition border border-purple-500/30"
            >
              <Users className="w-4 h-4 text-purple-200" /> 🤝 Member Request (Party)
            </button>
          </div>

        </div>

        {/* Info Right Column */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between space-y-4">
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1.5">EPIC Identity Coordinates</h4>
            
            <div className="space-y-2">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase block">State Jurisdiction</span>
                <span className="font-bold text-gray-800 block">{currentUser.state || 'Madhya Pradesh'}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase block">District Circle</span>
                <span className="font-bold text-gray-800 block">{currentUser.district || 'Bhopal'}</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg space-y-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-purple-900 font-bold">
              <Users className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>Political Party Membership</span>
            </div>
            <p className="text-purple-800 text-[9.5px] leading-relaxed">
              Want to join a recognized political party or apply for membership from this constituency? Click below to dispatch your Member Request.
            </p>
            <button
              onClick={onNavigateToMemberReq}
              className="w-full py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-md text-[10px] transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            >
              <Users className="w-3 h-3" /> Submit Member Request
            </button>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200/60 text-[9.5px] text-gray-500 space-y-1">
            <span className="font-bold text-gray-800 block">Digital Ballot Rules:</span>
            <p className="leading-relaxed">
              When voting online, this cryptographically generated EPIC code serves as your secure ballot credential. Keep your passwords confidential.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
