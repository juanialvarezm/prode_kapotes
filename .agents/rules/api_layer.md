---
trigger: always_on
description: API client conventions, Axios helper functions, JWT header injection, and response handling rules.
---

# API Layer Rules

All HTTP interactions with the backend MUST be defined inside `front/src/api.js`.

## 1. Auth Header Helper
Include the Bearer authorization header helper in `api.js`:

```js
function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
```

## 2. Function Definitions
Export explicit named async functions returning the axios promise:

```js
// Standard GET / POST
export async function createLeague(payload) {
  return axios.post(`${API_URL}/leagues`, payload, { headers: authHeaders() });
}

export async function getMyLeagues() {
  return axios.get(`${API_URL}/leagues`, { headers: authHeaders() });
}

// File / FormData uploads
export async function createGroup(formData) {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}
```

## 3. Usage in React Components
Components MUST import API calls from `../api` and wrap execution in async try/catch blocks:

```jsx
import { createLeague } from '../api';

try {
  await createLeague(payload);
  setSuccess('✅ Liga creada');
} catch (err) {
  setError(err?.response?.data?.error || 'Error al procesar la solicitud');
}
```
