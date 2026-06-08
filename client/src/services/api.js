import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('trintz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('trintz_token');
      localStorage.removeItem('trintz_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const createClient = (data) => API.post('/auth/create-client', data);
export const getClients = () => API.get('/auth/clients');
export const updateClient = (id, data) => API.put(`/auth/clients/${id}`, data);
export const updateProfile = (data) => API.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePassword = (data) => API.put('/auth/password', data);

// Projects
export const getProjects = () => API.get('/projects');
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const updateStages = (id, data) => API.put(`/projects/${id}/stages`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Tasks
export const getTasks = (projectId) => API.get(`/tasks/project/${projectId}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Payments
export const getPayments = (projectId) => API.get(`/payments/project/${projectId}`);
export const createPayment = (data) => API.post('/payments', data);
export const updatePayment = (id, data) => API.put(`/payments/${id}`, data);
export const getRazorpayKey = () => API.get('/payments/razorpay-key');
export const createRazorpayOrder = (paymentId) => API.post(`/payments/${paymentId}/razorpay-order`);
export const verifyRazorpayPayment = (paymentId, data) => API.post(`/payments/${paymentId}/verify`, data);

// Issues
export const getIssues = (projectId, params) => API.get(`/issues/project/${projectId}`, { params });
export const createIssue = (data) => API.post('/issues', data);
export const updateIssue = (id, data) => API.put(`/issues/${id}`, data);

// Files
export const getFiles = (projectId) => API.get(`/files/project/${projectId}`);
export const uploadFile = (formData) => API.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getDownloadUrl = (id) => `${API.defaults.baseURL}/files/download/${id}`;
export const deleteFile = (id) => API.delete(`/files/${id}`);

// Notes
export const getNotes = (projectId) => API.get(`/notes/project/${projectId}`);
export const createNote = (data) => API.post('/notes', data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');

// Activities
export const getActivities = (projectId) => API.get(`/activities/project/${projectId}`);

// Search
export const search = (params) => API.get('/search', { params });

export default API;
