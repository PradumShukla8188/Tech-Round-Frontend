import axios from 'axios';

const API_TIMEOUT_MS = 60000;
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 2;

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:4001',
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error) => {
  if (!error.config || error.config.__retryCount >= MAX_RETRIES) return false;
  if (error.code === 'ECONNABORTED') return true;
  if (!error.response) return true;
  return error.response.status >= 500;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.__retryCount = config.__retryCount || 0;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (shouldRetry(config)) {
      config.__retryCount += 1;
      await sleep(RETRY_DELAY_MS * config.__retryCount);
      return apiClient(config);
    }

    if (error.response?.status === 401 && !config?.url?.includes('/login') && !config?.url?.includes('/onBoarding')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.msg).join(', ');
  }
  if (error.code === 'ECONNABORTED') {
    return 'Server is taking too long. The backend may be waking up — please try again.';
  }
  if (!error.response) {
    return 'Cannot reach server. Check your connection or try again in a moment.';
  }
  return data?.message || error.message || 'Something went wrong';
};

export default apiClient;
