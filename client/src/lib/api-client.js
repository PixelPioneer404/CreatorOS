import { supabase } from './supabase.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

export class ApiClientError extends Error {
  constructor(message, code = 'API_ERROR', details = [], status = 500) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

let mockTokenOverride = null;

export function setMockToken(token) {
  mockTokenOverride = token;
}

export async function getAuthHeader() {
  if (mockTokenOverride) {
    return `Bearer ${mockTokenOverride}`;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return `Bearer ${session.access_token}`;
    }
  } catch {
    // Supabase session retrieval fallback
  }

  // Check localStorage for dev/test mock token
  const devToken = localStorage.getItem('creatoros_auth_token');
  if (devToken) {
    return `Bearer ${devToken}`;
  }

  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const authHeader = await getAuthHeader();
  if (authHeader && !headers.Authorization) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError('Invalid server response format.', 'NETWORK_ERROR', [], response.status);
  }

  if (!response.ok || json.success === false) {
    const err = json?.error || {};
    throw new ApiClientError(
      err.message || `Request failed with status ${response.status}`,
      err.code || 'UNKNOWN_ERROR',
      err.details || [],
      response.status
    );
  }

  return json.data;
}
