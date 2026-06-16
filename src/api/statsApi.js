import apiClient from './apiClient';

export const getDashboardStats = () => apiClient.get('/api/v1/stats/dashboard');
