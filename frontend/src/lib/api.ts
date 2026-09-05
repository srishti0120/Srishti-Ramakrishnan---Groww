const API_BASE = '/api';

async function fetchApi(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

const get = (url: string) => fetchApi(url);
const post = (url: string, data: any) => fetchApi(url, { method: 'POST', body: JSON.stringify(data) });
const patch = (url: string, data: any) => fetchApi(url, { method: 'PATCH', body: JSON.stringify(data) });
const del = (url: string) => fetchApi(url, { method: 'DELETE' });

export const api = {
  // User
  createUser: (id: string) => post('/users', { id }),
  
  // Watchlists
  getWatchlists: (userId: string) => get(`/watchlists?userId=${userId}`),
  createWatchlist: (userId: string, name: string) => post('/watchlists', { userId, name }),
  deleteWatchlist: (id: string) => del(`/watchlists/${id}`),
  
  // Items
  getItems: (watchlistId: string) => get(`/watchlists/${watchlistId}/items`),
  addItem: (watchlistId: string, data: { symbol: string, alertAbove?: number, alertBelow?: number, notes?: string }) => post(`/watchlists/${watchlistId}/items`, data),
  removeItem: (watchlistId: string, symbol: string) => del(`/watchlists/${watchlistId}/items/${symbol}`),
  updateItem: (watchlistId: string, symbol: string, data: any) => patch(`/watchlists/${watchlistId}/items/${symbol}`, data),
  
  // Market
  getPulse: (userId: string) => get(`/pulse/${userId}`),
  markSeen: (userId: string) => post(`/pulse/${userId}/seen`, {}),
  searchSymbols: (query: string) => get(`/search?q=${query}`),
  
  // Export/Import
  exportData: (userId: string) => get(`/export/${userId}`),
  importData: (userId: string, data: any) => post(`/import/${userId}`, data),
};
