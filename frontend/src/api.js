const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080/api`;

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('fashion_session') || 'null');
  } catch {
    localStorage.removeItem('fashion_session');
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem('fashion_session', JSON.stringify(session));
}

export function logout() {
  localStorage.removeItem('fashion_session');
}

export async function api(path, options = {}) {
  const session = getSession();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
