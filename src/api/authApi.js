import apiClient from './apiClient';

export const register = (data) =>
  apiClient.post('/api/v1/onBoarding/register', data);

export const login = (data) =>
  apiClient.post('/api/v1/onBoarding/login', data);
