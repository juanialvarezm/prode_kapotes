import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'https://prodekapotes-production.up.railway.app').replace(/\/$/, '');

// Global response interceptor to handle expired JWT tokens (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.endsWith('/login');
      if (!isLoginRequest) {
        localStorage.clear();
        window.location.href = '/#/auth';
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);


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

export async function verifyEmail(token) {
  return axios.get(`${API_URL}/verify-email`, { params: { token } });
}

export async function getMe() {
  return axios.get(`${API_URL}/me`, { headers: authHeaders() });
}

export async function getUserProfile(userId, page = 1, perPage = 10) {
  return axios.get(`${API_URL}/users/${userId}`, {
    params: { page, per_page: perPage },
    headers: authHeaders(),
  });
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

export async function getGroupInviteLink(groupId) {
  return axios.post(`${API_URL}/groups/${groupId}/invitacion`, {}, { headers: authHeaders() });
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

export async function searchUsers(query, page = 1) {
  return axios.get(`${API_URL}/users/search`, { params: { q: query, page }, headers: authHeaders() });
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


export async function getGroupPredictions(groupId, userId = null) {
  const params = {};
  if (userId) params.user_id = userId;
  return axios.get(`${API_URL}/groups/${groupId}/predictions`, { params, headers: authHeaders() });
}

// --- Fetch matches from WC2026 API ---

export async function fetchApiMatches() {
  return axios.post(`${API_URL}/sync_wc2026`, {}, { headers: authHeaders() });
}

// --- Wordle API ---

export async function saveWordleResult(won, attempts, playerName) {
  return axios.post(
    `${API_URL}/wordle/save`,
    { won, attempts, player_name: playerName },
    { headers: authHeaders() }
  );
}

export async function getWordleHistory() {
  return axios.get(`${API_URL}/wordle/history`, { headers: authHeaders() });
}

// --- Leagues ---

export async function createLeague(payload) {
  return axios.post(`${API_URL}/leagues`, payload, { headers: authHeaders() });
}

export async function getMyLeagues() {
  return axios.get(`${API_URL}/leagues`, { headers: authHeaders() });
}

export async function getLeagueById(leagueId) {
  return axios.get(`${API_URL}/leagues/${leagueId}`, { headers: authHeaders() });
}

export async function deleteLeague(leagueId) {
  return axios.delete(`${API_URL}/leagues/${leagueId}`, { headers: authHeaders() });
}

export async function createLeagueTeam(leagueId, payload) {
  return axios.post(`${API_URL}/leagues/${leagueId}/teams`, payload, { headers: authHeaders() });
}

export async function deleteLeagueTeam(leagueId, teamId) {
  return axios.delete(`${API_URL}/leagues/${leagueId}/teams/${teamId}`, { headers: authHeaders() });
}

export async function createLeagueMatch(leagueId, payload) {
  return axios.post(`${API_URL}/leagues/${leagueId}/matches`, payload, { headers: authHeaders() });
}

export async function updateLeagueMatch(leagueId, matchId, payload) {
  return axios.patch(`${API_URL}/leagues/${leagueId}/matches/${matchId}`, payload, { headers: authHeaders() });
}

export async function deleteLeagueMatch(leagueId, matchId) {
  return axios.delete(`${API_URL}/leagues/${leagueId}/matches/${matchId}`, { headers: authHeaders() });
}

export async function addLeagueMember(leagueId, username) {
  return axios.post(`${API_URL}/leagues/${leagueId}/members`, { username }, { headers: authHeaders() });
}

export async function removeLeagueMember(leagueId, userId) {
  return axios.delete(`${API_URL}/leagues/${leagueId}/members/${userId}`, { headers: authHeaders() });
}


// --- Organized Matches ---

export async function getOrganizedMatches(groupId) {
  return axios.get(`${API_URL}/groups/${groupId}/organized-matches`, { headers: authHeaders() });
}

export async function createOrganizedMatch(groupId, matchData) {
  return axios.post(`${API_URL}/groups/${groupId}/organized-matches`, matchData, { headers: authHeaders() });
}

export async function deleteOrganizedMatch(groupId, matchId) {
  return axios.delete(`${API_URL}/groups/${groupId}/organized-matches/${matchId}`, { headers: authHeaders() });
}

export async function toggleMatchAttendance(groupId, matchId, confirmed) {
  return axios.post(`${API_URL}/groups/${groupId}/organized-matches/${matchId}/attend`, { confirmed }, { headers: authHeaders() });
}

export async function toggleParticipantPayment(groupId, matchId, userId, paid) {
  return axios.post(`${API_URL}/groups/${groupId}/organized-matches/${matchId}/participants/${userId}/pay`, { paid }, { headers: authHeaders() });
}

export async function voteMatchMvp(groupId, matchId, votedId) {
  return axios.post(`${API_URL}/groups/${groupId}/organized-matches/${matchId}/vote-mvp`, { voted_id: votedId }, { headers: authHeaders() });
}

export async function uploadMatchPhoto(groupId, matchId, formData) {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups/${groupId}/organized-matches/${matchId}/photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}


// --- Football Fields ---

export async function getFootballFields(filters = {}) {
  return axios.get(`${API_URL}/fields`, { params: filters, headers: authHeaders() });
}

export async function getFootballFieldById(fieldId) {
  return axios.get(`${API_URL}/fields/${fieldId}`, { headers: authHeaders() });
}



