import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export async function getMyGroups() {
  return axios.get(`${API_URL}/mygroups`, { headers: authHeaders() });
}

export async function createGroup(payload) {
  return axios.post(`${API_URL}/groups`, payload, { headers: authHeaders() });
}

export async function joinGroup(groupId) {
  return axios.post(`${API_URL}/groups/${groupId}/join`, {}, { headers: authHeaders() });
}

export async function getMatches() {
  return axios.get(`${API_URL}/matches`);
}

export async function submitPrediction(payload) {
  return axios.post(`${API_URL}/predictions`, payload, { headers: authHeaders() });
}

export async function getGroupScores(groupId) {
  return axios.get(`${API_URL}/groups/${groupId}/scores`, { headers: authHeaders() });
}

export async function getGroupById(groupId) {
  return axios.get(`${API_URL}/groups/${groupId}`, { headers: authHeaders() });
}

export async function searchUsers(query) {
  return axios.get(`${API_URL}/users/search`, { params: { q: query }, headers: authHeaders() });
}

export async function addMemberToGroup(groupId, userId) {
  return axios.post(`${API_URL}/groups/${groupId}/add_member`, { user_id: userId }, { headers: authHeaders() });
}
