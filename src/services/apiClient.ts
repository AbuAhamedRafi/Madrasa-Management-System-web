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
    const path = window.location.pathname;
    if (
      error.response?.status === 401 &&
      path !== '/' &&
      !path.startsWith('/login') &&
      !path.startsWith('/activate')
    ) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

