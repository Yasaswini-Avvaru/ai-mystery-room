const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function resolveAssetUrl(path) {
  if (!path || /^https?:\/\//i.test(path)) return path;
  return apiBaseUrl ? new URL(path, apiBaseUrl).toString() : path;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  } catch {
    throw new Error(`Could not reach the case API${apiBaseUrl ? ` at ${apiBaseUrl}` : ''}. Check the frontend API URL and backend deployment.`);
  }
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    if (response.status === 429) throw new Error('The API host rate-limited this request (429). Wait a few minutes before retrying; if it keeps happening, check the Render service rate limits.');
    throw new Error(`The case API returned a non-JSON response (${response.status}). Check VITE_API_BASE_URL and the backend URL.`);
  }
  if (!response.ok || !body.success) {
    const message = body?.error?.message || `Case API request failed (${response.status}).`;
    const code = body?.error?.code;
    const details = Array.isArray(body?.error?.details) ? body.error.details.join(' ') : '';
    const prefix = code && message === 'An unexpected server error occurred.' ? `${code}: ${message}` : message;
    throw new Error([prefix, details].filter(Boolean).join(' '));
  }
  return body.data;
}
export const api = {
  createCase: (payload) => request('/cases', { method: 'POST', body: JSON.stringify(payload) }),
  getCase: (id) => request(`/cases/${id}`),
  getEvidence: (id, evidenceId) => request(`/cases/${id}/evidence/${evidenceId}`),
  generateEvidenceImage: (id, evidenceId) => request(`/cases/${id}/evidence/${evidenceId}/media`, { method: 'POST', body: '{}' }),
  accuse: (id, payload) => request(`/cases/${id}/accusations`, { method: 'POST', body: JSON.stringify(payload) }),
  solution: (id) => request(`/cases/${id}/solution`),
  reveal: (id) => request(`/cases/${id}/reveal-solution`, { method: 'POST', body: '{}' })
};
