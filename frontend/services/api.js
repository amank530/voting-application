// Client-side API Service Layer for Election Commission of India Portal
// Handles REST communication with standard error recovery

const API_BASE = '';

async function fetchJson(url, options) {
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
    requestOtp: (mobileNumber) => 
      fetchJson(`${API_BASE}/api/auth/request-otp`, {
        method: 'POST',
        body: JSON.stringify({ mobileNumber }),
      }),
      
    verifyOtp: (mobileNumber, otp) => 
      fetchJson(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ mobileNumber, otp }),
      }),

    citizenSignup: (data) =>
      fetchJson(`${API_BASE}/api/auth/citizen-signup`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    citizenLogin: (aadharNumber, password) =>
      fetchJson(`${API_BASE}/api/auth/citizen-login`, {
        method: 'POST',
        body: JSON.stringify({ aadharNumber, password }),
      }),

    bypass: (role) =>
      fetchJson(`${API_BASE}/api/auth/bypass`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),

    signup: (data) =>
      fetchJson(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProfile: (id) => 
      fetchJson(`${API_BASE}/api/auth/profile/${id}`),

    updateProfile: (id, data) => 
      fetchJson(`${API_BASE}/api/auth/profile/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    blockUser: (id, isBlocked, adminId) => 
      fetchJson(`${API_BASE}/api/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isBlocked, adminId }),
      }),
  },

  elections: {
    list: () => 
      fetchJson(`${API_BASE}/api/elections`),

    create: (data) => 
      fetchJson(`${API_BASE}/api/elections`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id, status, adminId) => 
      fetchJson(`${API_BASE}/api/elections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminId }),
      }),

    delete: (id, adminId) => 
      fetchJson(`${API_BASE}/api/elections/${id}?adminId=${adminId}`, {
        method: 'DELETE',
      }),
  },

  parties: {
    list: () => 
      fetchJson(`${API_BASE}/api/parties`),

    create: (data) => 
      fetchJson(`${API_BASE}/api/parties`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id, status, adminId) => 
      fetchJson(`${API_BASE}/api/parties/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminId }),
      }),

    update: (id, data) =>
      fetchJson(`${API_BASE}/api/parties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  candidates: {
    list: () => 
      fetchJson(`${API_BASE}/api/candidates`),

    register: (data) => 
      fetchJson(`${API_BASE}/api/candidates`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id, status, adminId) => 
      fetchJson(`${API_BASE}/api/candidates/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminId }),
      }),

    partyApprove: (id, status, partyName, partySymbol, adminId) => 
      fetchJson(`${API_BASE}/api/candidates/${id}/party-approve`, {
        method: 'PUT',
        body: JSON.stringify({ status, partyName, partySymbol, adminId }),
      }),
  },

  codes: {
    list: () => 
      fetchJson(`${API_BASE}/api/codes`),

    generate: (data) => 
      fetchJson(`${API_BASE}/api/codes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  votes: {
    status: (voterId, electionId) => 
      fetchJson(`${API_BASE}/api/votes/status?voterId=${voterId}&electionId=${electionId}`),

    cast: (electionId, voterId, candidateId, partyId) => 
      fetchJson(`${API_BASE}/api/votes`, {
        method: 'POST',
        body: JSON.stringify({ electionId, voterId, candidateId, partyId }),
      }),
  },

  notifications: {
    list: () => 
      fetchJson(`${API_BASE}/api/notifications`),

    create: (data) => 
      fetchJson(`${API_BASE}/api/notifications`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  stats: {
    live: () => 
      fetchJson(`${API_BASE}/api/stats`),
    logs: (adminId) => 
      fetchJson(`${API_BASE}/api/logs?adminId=${adminId}`),
  },

  admin: {
    backup: (adminId) => 
      fetchJson(`${API_BASE}/api/admin/backup`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      }),
    restore: (adminId) => 
      fetchJson(`${API_BASE}/api/admin/restore`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      }),
  }
};
