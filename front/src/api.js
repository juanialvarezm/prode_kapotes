import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://prodekapotes-production.up.railway.app/';

function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function login(credentials) {
  return axios.post(`${API_URL}/login`, credentials);
}

export async function register(payload) {
  return axios.post(`${API_URL}/register`, payload);
}

export async function getMe() {
  return axios.get(`${API_URL}/me`, { headers: authHeaders() });
}

export async function updateProfile(formData) {
  // formData is a FormData object (for file upload support)
  const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/me`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type manually - let axios handle it with FormData
    },
  });
}

export async function getMyGroups() {
  return axios.get(`${API_URL}/mygroups`, { headers: authHeaders() });
}

export async function createGroup(formData) {
  // formData is a FormData object (for file upload support)
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function joinGroup(groupId) {
  return axios.post(`${API_URL}/groups/${groupId}/join`, {}, { headers: authHeaders() });
}

export async function getMatches(page = 1, perPage = 10) {
  return axios.get(`${API_URL}/matches`, { params: { page, per_page: perPage } });
}

export async function submitPrediction(payload) {
  return axios.post(`${API_URL}/predictions`, payload, { headers: authHeaders() });
}

export async function getGroupScores(groupId) {
  return axios.get(`${API_URL}/groups/${groupId}/scores`, { headers: authHeaders() });
}

export async function getGroupById(groupId, membersPage = 1) {
  return axios.get(`${API_URL}/groups/${groupId}`, {
    params: { members_page: membersPage },
    headers: authHeaders(),
  });
}

export async function searchUsers(query) {
  return axios.get(`${API_URL}/users/search`, { params: { q: query }, headers: authHeaders() });
}

export async function addMemberToGroup(groupId, userId) {
  return axios.post(`${API_URL}/groups/${groupId}/add_member`, { user_id: userId }, { headers: authHeaders() });
}

// --- Join Request System ---

export async function getJoinRequests(groupId) {
  return axios.get(`${API_URL}/groups/${groupId}/requests`, { headers: authHeaders() });
}

export async function acceptJoinRequest(groupId, requestId) {
  return axios.post(`${API_URL}/groups/${groupId}/requests/${requestId}/accept`, {}, { headers: authHeaders() });
}

export async function rejectJoinRequest(groupId, requestId) {
  return axios.post(`${API_URL}/groups/${groupId}/requests/${requestId}/reject`, {}, { headers: authHeaders() });
}



export async function leaveGroup(groupId) {
  return axios.post(`${API_URL}/groups/${groupId}/leave`, {}, { headers: authHeaders() });
}

export async function kickMember(groupId, userId) {
  return axios.post(`${API_URL}/groups/${groupId}/kick/${userId}`, {}, { headers: authHeaders() });
}

// --- Avatar ---

export async function updateGroupAvatar(groupId, file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups/${groupId}/avatar`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function getAvatarUrl(path) {
  if (!path) return null;
  return `${API_URL}${path}`;
}

export async function getMyPendingRequests() {
  return axios.get(`${API_URL}/my-requests`, { headers: authHeaders() });
}

export async function updateGroupPrizePool(groupId, prizePool) {
  return axios.patch(`${API_URL}/groups/${groupId}/prize_pool`, { prize_pool: prizePool }, { headers: authHeaders() });
}


export async function getGroupPredictions(groupId, userId = null) {
  const params = {};
  if (userId) params.user_id = userId;
  return axios.get(`${API_URL}/groups/${groupId}/predictions`, { params, headers: authHeaders() });
}

// --- Fetch matches from WC2026 API ---

export async function fetchApiMatches() {
  return axios.post(`${API_URL}/sync_wc2026`, {}, { headers: authHeaders() });
}
