import apiClient from './apiClient';

export const getAllBlogs = () => apiClient.get('/api/v1/blog');
export const getActiveBlogs = () => apiClient.get('/api/v1/blog/active');
export const getMyBlogs = () => apiClient.get('/api/v1/blog/my');
export const getBlogById = (id) => apiClient.get(`/api/v1/blog/${id}`);
export const createBlog = (data) => apiClient.post('/api/v1/blog', data);
export const updateBlog = (id, data) => apiClient.patch(`/api/v1/blog/${id}`, data);
export const deleteBlog = (id) => apiClient.delete(`/api/v1/blog/${id}`);
