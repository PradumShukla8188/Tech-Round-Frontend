import apiClient from './apiClient';

export const getAllUsers = () => apiClient.get('/api/v1/users');
export const getUserById = (id) => apiClient.get(`/api/v1/users/${id}`);
export const createUser = (data) => apiClient.post('/api/v1/users', data);
export const updateUser = (id, data) => apiClient.patch(`/api/v1/users/${id}`, data);
export const deleteUser = (id) => apiClient.delete(`/api/v1/users/${id}`);
