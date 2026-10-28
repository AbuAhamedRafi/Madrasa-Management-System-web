import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

let csrfInitialized = false;

export async function ensureCsrfToken(): Promise<void> {
  if (!csrfInitialized) {
    await apiClient.get('/sanctum/csrf-cookie');
    csrfInitialized = true;
  }
}

// Global response interceptor for 401 unauthenticated redirect
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/activate')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

