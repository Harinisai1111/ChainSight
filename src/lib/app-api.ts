// HARDCODED SECURE URL FOR HUGGING FACE DEPLOYMENT
const API_BASE_URL = 'https://harinisai1111-chainsight-backend.hf.space';
const API_PREFIX = '/api/v1';

console.log("🚀 ChainSight API initialized with:", API_BASE_URL);

// Clerk token getter — set by main.tsx after ClerkProvider loads
let clerkGetToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (getter: () => Promise<string | null>) => {
  clerkGetToken = getter;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
};

export type Upload = {
  id: string;
  name?: string;
  filename?: string;
  date?: string;
  uploadedAt?: string;
  status?: string;
  records?: number;
  size?: number;
  fileType?: string;
  processingTime?: number;
  description?: string;
};

export type Pattern = {
  id: string;
  type: string;
  description: string;
  severity: string;
  confidence?: number;
};

export type SuspiciousAddress = {
  address: string;
  riskScore?: number;
  transactionCount?: number;
  totalVolume?: number;
  patterns?: string[];
  firstSeen?: string;
  lastSeen?: string;
};

export type GraphData = {
  nodes: any[];
  edges: any[];
  metadata?: any;
};

export type Report = {
  id: string;
  report_type: string;
  format: string;
  status: string;
  createdAt: string;
  fileSize?: number;
  downloadUrl?: string;
};

export type ApiKey = {
  id: string;
  name: string;
  key: string;
  prefix?: string;
  created_at?: string;
  lastUsed?: string;
  expiresAt?: string;
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  if (clerkGetToken) {
    const token = await clerkGetToken();
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
};

const request = async (path: string, options: RequestInit = {}) => {
  let url = `${API_BASE_URL}${API_PREFIX}${path}`;
  
  // ULTRA-AGGRESSIVE FIX: If we are on HTTPS, the API MUST be HTTPS
  if (window.location.protocol === 'https:' && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  const authHeaders = await getAuthHeaders();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      ...authHeaders,
    },
  });
  if (!res.ok) {
    const body = await parseJson(res);
    const message = body?.detail || body?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return parseJson(res);
};

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload/file', { method: 'POST', body: formData });
  },
  getHistory: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    return request(`/upload/history?${params.toString()}`, { method: 'GET' });
  },
};

export const analysisApi = {
  getPatterns: async (uploadId?: string) => {
    const params = new URLSearchParams();
    if (uploadId) params.append('upload_id', uploadId);
    return request(`/analysis/patterns?${params.toString()}`, { method: 'GET' });
  },
  getSuspiciousAddresses: async (uploadId: string, riskLevel?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (riskLevel) params.append('risk_level', riskLevel);
    return request(`/analysis/suspicious-addresses/${encodeURIComponent(uploadId)}?${params.toString()}`, { method: 'GET' });
  },
  runAnalysis: async (uploadId: string) => {
    return request(`/analysis/run/${encodeURIComponent(uploadId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

export const graphApi = {
  getSuspiciousSubgraph: async (uploadId: string, topK = 20, hop = 2) => {
    return request(`/graph/suspicious/${encodeURIComponent(uploadId)}?top_k=${topK}&hop=${hop}`, { method: 'GET' });
  },
};

export const dashboardApi = {
  getStats: async () => {
    return request('/dashboard/stats', { method: 'GET' });
  },
};

export const reportsApi = {
  getHistory: async (uploadId?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (uploadId) params.append('upload_id', uploadId);
    return request(`/reports?${params.toString()}`, { method: 'GET' });
  },
  generate: async (payload: Record<string, any>) => {
    return request('/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  downloadReport: async (reportId: string) => {
    const authHeaders = await getAuthHeaders();
    let url = `${API_BASE_URL}${API_PREFIX}/reports/download/${encodeURIComponent(reportId)}`;
    
    // Force HTTPS if on secure origin
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    
    const res = await fetch(url, { method: 'GET', headers: authHeaders });
    if (!res.ok) {
      const text = await res.text();
      let detail = text;
      try { detail = JSON.parse(text)?.detail || text; } catch {}
      throw new Error(detail || `HTTP ${res.status}`);
    }
    return res.blob();
  },
};

export const settingsApi = {
  getApiKeys: async () => {
    const response = await request('/settings/api-keys', { method: 'GET' });
    return response.keys || [];
  },
  updateSettings: async (settings: { name?: string; email?: string; company?: string; role?: string; }) => {
    return request('/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: settings.name }),
    });
  },
  createApiKey: async (name: string) => {
    return request('/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },
  deleteApiKey: async (keyId: string) => {
    return request(`/settings/api-keys/${encodeURIComponent(keyId)}`, { method: 'DELETE' });
  },
};
