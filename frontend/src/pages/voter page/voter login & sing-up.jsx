import React from 'react';

export default function VoterLoginSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div>
          <span className="text-4xl">🗳️</span>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 font-display">Voter Identity Gateway</h2>
          <p className="mt-2 text-xs text-gray-500">
            Secure Aadhaar & Biometric authenticated logins are managed directly through the National Identity Widget.
          </p>
        </div>
      </div>
    </div>
  );
}
