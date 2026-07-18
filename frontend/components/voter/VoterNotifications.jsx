import React, { useState } from 'react';
import { Bell, Info, ShieldAlert, CheckCircle2, Calendar, BookmarkCheck } from 'lucide-react';

export default function VoterNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Voter Registry Application Certified',
      content: 'Your identity proof documents have been matched against UIDAI Biometric databases. Registration state is active.',
      time: 'Just Now',
      type: 'SUCCESS',
      read: false
    },
    {
      id: 'n2',
      title: 'Polling Reminder: Nagar Panchayat Phase II',
      content: 'Digital booths for Bhopal Assembly constituency are scheduled to open on October 15, 2026. Keep your login passcode handy.',
      time: '2 hours ago',
      type: 'CALENDAR',
      read: false
    },
    {
      id: 'n3',
      title: 'Lok Sabha Nomination Scrutiny Finalized',
      content: 'The Election Commission has published the verified candidate profiles for Vidhan Sabha. Browse profiles under "Candidates".',
      time: '1 day ago',
      type: 'INFO',
      read: true
    },
    {
      id: 'n4',
      title: 'Security Advisory: Passcode Hygiene',
      content: 'Remember that the ECI never solicits voter passcodes via email or text. Enable 2FA in settings for stronger security.',
      time: '3 days ago',
      type: 'WARNING',
      read: true
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-5">
      
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-600 animate-bounce" />
          Electoral Bulletin Broadcasts
        </h3>

        <button
          onClick={handleMarkAllRead}
          className="text-[10px] font-bold text-primary-600 hover:text-primary-800 transition cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-gray-100 space-y-1">
        {notifications.map((n) => {
          return (
            <div 
              key={n.id} 
              onClick={() => handleToggleRead(n.id)}
              className={`p-4 flex gap-3.5 items-start transition rounded-xl cursor-pointer ${
                n.read ? 'opacity-70 hover:bg-gray-50/50' : 'bg-primary-50/15 hover:bg-primary-50/30'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {n.type === 'CALENDAR' && <Calendar className="w-4 h-4 text-saffron-600" />}
                {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-600" />}
                {n.type === 'WARNING' && <ShieldAlert className="w-4 h-4 text-red-600" />}
              </div>

              <div className="space-y-1 text-xs flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className={`font-bold ${n.read ? 'text-gray-700' : 'text-gray-900 font-extrabold'}`}>{n.title}</h5>
                  <span className="text-[9px] text-gray-400 font-mono shrink-0">{n.time}</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">{n.content}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-2"></span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
