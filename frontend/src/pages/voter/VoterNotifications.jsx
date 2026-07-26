import React, { useState, useEffect } from 'react';
import { Bell, Info, ShieldAlert, CheckCircle2, Calendar, Users, ExternalLink, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function VoterNotifications({ currentUser, onNavigateTab }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();

    const handleStorageChange = () => {
      loadNotifications();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  const loadNotifications = async () => {
    setLoading(true);
    const savedNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
    let apiNotifs = [];

    try {
      const fetched = await api.notifications.list();
      if (Array.isArray(fetched)) {
        apiNotifs = fetched.map(n => ({
          id: n.id || `notif-${Math.random()}`,
          title: n.title,
          content: n.content || n.message,
          time: n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.date || 'Just now'),
          type: n.type || n.category || 'INFO',
          read: false
        }));
      }
    } catch (err) {
      console.error('Error fetching API notifications in VoterNotifications:', err);
    }
    
    // Default system alerts
    const defaultNotifs = [
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
        content: 'Digital voting portals for Bhopal Assembly constituency are scheduled to open on October 15, 2026. Keep your login passcode handy.',
        time: '2 hours ago',
        type: 'CALENDAR',
        read: false
      }
    ];

    // Combine user specific dynamic notifications at top
    const combined = [...savedNotifs, ...apiNotifs, ...defaultNotifs];
    const uniqueNotifs = [];
    const seen = new Set();
    for (const item of combined) {
      const key = item.id || `${item.title}-${item.content}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNotifs.push(item);
      }
    }
    setNotifications(uniqueNotifs);
    setLoading(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-5 text-left">
      
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-600 animate-bounce" />
          Personal Electoral Bulletin Broadcasts & Alerts
        </h3>

        <button
          onClick={handleMarkAllRead}
          className="text-[10px] font-bold text-primary-600 hover:text-primary-800 transition cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-gray-100 space-y-2">
        {notifications.map((n) => {
          const isMemberApproval = n.type === 'MEMBER_REQUEST_APPROVED' || n.actionLink === 'MEMBER_REQUEST_FORM';
          
          return (
            <div 
              key={n.id} 
              className={`p-4 rounded-xl transition space-y-2 ${
                isMemberApproval 
                  ? 'bg-purple-50/70 border border-purple-200' 
                  : n.read ? 'opacity-70 hover:bg-gray-50/50' : 'bg-primary-50/15 hover:bg-primary-50/30'
              }`}
            >
              <div className="flex gap-3.5 items-start">
                <div className="shrink-0 mt-0.5">
                  {isMemberApproval && <Users className="w-5 h-5 text-purple-700" />}
                  {!isMemberApproval && n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {!isMemberApproval && n.type === 'CALENDAR' && <Calendar className="w-4 h-4 text-saffron-600" />}
                  {!isMemberApproval && n.type === 'INFO' && <Info className="w-4 h-4 text-blue-600" />}
                  {!isMemberApproval && n.type === 'WARNING' && <ShieldAlert className="w-4 h-4 text-red-600" />}
                </div>

                <div className="space-y-1 text-xs flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className={`font-bold ${isMemberApproval ? 'text-purple-950 font-black text-sm' : n.read ? 'text-gray-700' : 'text-gray-900 font-extrabold'}`}>
                      {n.title}
                    </h5>
                    <span className="text-[9px] text-gray-400 font-mono shrink-0">{n.time}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">{n.content}</p>

                  {/* INTERACTIVE LINK BUTTON FOR APPROVED MEMBERSHIP FORM */}
                  {isMemberApproval && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateTab) {
                            onNavigateTab('MEMBER_REQUEST');
                          }
                        }}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2 border border-purple-500/30"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-purple-200" />
                        <span>📋 Open Request Political Party Membership Form</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {!n.read && !isMemberApproval && (
                  <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-2"></span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
