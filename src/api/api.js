/**
 * Helper for making authenticated API calls.
 * Automatically adds the JWT token from localStorage to the headers.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('scolarite_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Optional: handle token expiration by logging out
    localStorage.removeItem('scolarite_user');
    localStorage.removeItem('scolarite_token');
    window.location.href = '/login';
    return;
  }

  return response;
}
