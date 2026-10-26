async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) throw new Error(body?.error?.message || 'Something went wrong. Please try again.');
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
