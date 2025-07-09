const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Generic API request function
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Pegar token do localStorage ou cookie
  const token = localStorage.getItem('auth_token') || getCookie('token');
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    // Se 401, remover token inválido
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Função helper para pegar cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Convenience methods
export const apiGet = (endpoint: string) => apiRequest(endpoint);

export const apiPost = (endpoint: string, data?: any) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiPut = (endpoint: string, data?: any) =>
  apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiDelete = (endpoint: string) =>
  apiRequest(endpoint, { method: 'DELETE' });