import { 
  User, Election, PoliticalParty, Candidate, CandidateCode, 
  Vote, AuditLog, EciNotification, LiveStats, ElectionLevel 
} from '../types';

const API_BASE = '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    requestOtp: (mobileNumber: string) => 
      fetchJson<{ success: boolean; message: string; otp?: string }>(`${API_BASE}/api/auth/request-otp`, {
        method: 'POST',
        body: JSON.stringify({ mobileNumber }),
      }),
      
    verifyOtp: (mobileNumber: string, otp: string) => 
      fetchJson<{ success: boolean; user: User; isNewUser: boolean; token: string }>(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ mobileNumber, otp }),
      }),

    getProfile: (id: string) => 
      fetchJson<User>(`${API_BASE}/api/auth/profile/${id}`),

    updateProfile: (id: string, data: Partial<User>) => 
      fetchJson<{ success: boolean; user: User }>(`${API_BASE}/api/auth/profile/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    blockUser: (id: string, isBlocked: boolean, adminId: string) => 
      fetchJson<{ success: boolean; user: User }>(`${API_BASE}/api/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isBlocked, adminId }),
      }),
  },

  elections: {
    list: () => 
      fetchJson<Election[]>(`${API_BASE}/api/elections`),

    create: (data: Omit<Election, 'id' | 'candidateCount' | 'voteCount'> & { adminId: string }) => 
      fetchJson<{ success: boolean; election: Election }>(`${API_BASE}/api/elections`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: Election['status'], adminId: string) => 
      fetchJson<{ success: boolean; election: Election }>(`${API_BASE}/api/elections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminId }),
      }),

    delete: (id: string, adminId: string) => 
      fetchJson<{ success: boolean }>(`${API_BASE}/api/elections/${id}?adminId=${adminId}`, {
        method: 'DELETE',
      }),
  },

  parties: {
    list: () => 
      fetchJson<PoliticalParty[]>(`${API_BASE}/api/parties`),

    create: (data: Omit<PoliticalParty, 'id' | 'approved' | 'status'>) => 
      fetchJson<{ success: boolean; party: PoliticalParty }>(`${API_BASE}/api/parties`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: PoliticalParty['status'], adminId: string) => 
      fetchJson<{ success: boolean; party: PoliticalParty }>(`${API_BASE}/api/parties/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminId }),
      }),
  },

  candidates: {
    list: () => 
      fetchJson<Candidate[]>(`${API_BASE}/api/candidates`),

    register: (data: Omit<Candidate, 'id' | 'status'>) => 
      fetchJson<{ success: boolean; candidate: Candidate }>(`${API_BASE}/api/candidates`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: Candidate['status'], adminId: string) => 
      fetchJson<{ success: boolean; candidate: Candidate }>(`${API_BASE}/api/candidates/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminId }),
      }),
  },

  codes: {
    list: () => 
      fetchJson<CandidateCode[]>(`${API_BASE}/api/codes`),

    generate: (data: { 
      partyId: string; 
      partyAbbrev: string; 
      constituency: string; 
      electionLevel: ElectionLevel; 
      position: string; 
      electionId: string; 
      adminId: string; 
    }) => 
      fetchJson<{ success: boolean; code: CandidateCode }>(`${API_BASE}/api/codes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  votes: {
    status: (voterId: string, electionId: string) => 
      fetchJson<{ hasVoted: boolean }>(`${API_BASE}/api/votes/status?voterId=${voterId}&electionId=${electionId}`),

    cast: (electionId: string, voterId: string, candidateId: string, partyId?: string) => 
      fetchJson<{ success: boolean; receipt: Vote }>(`${API_BASE}/api/votes`, {
        method: 'POST',
        body: JSON.stringify({ electionId, voterId, candidateId, partyId }),
      }),
  },

  notifications: {
    list: () => 
      fetchJson<EciNotification[]>(`${API_BASE}/api/notifications`),

    create: (data: { title: string; content: string; type: EciNotification['type']; adminId: string }) => 
      fetchJson<{ success: boolean; notification: EciNotification }>(`${API_BASE}/api/notifications`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  stats: {
    live: () => 
      fetchJson<LiveStats>(`${API_BASE}/api/stats`),
    logs: (adminId: string) => 
      fetchJson<AuditLog[]>(`${API_BASE}/api/logs?adminId=${adminId}`),
  },

  admin: {
    backup: (adminId: string) => 
      fetchJson<{ success: boolean; timestamp: string }>(`${API_BASE}/api/admin/backup`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      }),
    restore: (adminId: string) => 
      fetchJson<{ success: boolean; timestamp: string }>(`${API_BASE}/api/admin/restore`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      }),
  }
};
