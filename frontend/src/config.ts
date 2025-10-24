export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
export const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response;
}