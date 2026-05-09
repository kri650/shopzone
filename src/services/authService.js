import api from '../utils/api';

export const authService = {
  async login(payload) {
    // Only use the real API for login. No more mock fallbacks.
    const { data } = await api.post('/auth/customer/login', payload);
    return data.data;
  },
  async register(payload) {
    // Only use the real API for registration.
    const { data } = await api.post('/auth/customer/register', payload);
    return data.data;
  },
  async forgotPassword(email) {
    const { data } = await api.post('/auth/customer/forgot-password', { email });
    return data;
  },
  async resetPassword(token, password) {
    const { data } = await api.patch(`/auth/customer/reset-password/${token}`, { password });
    return data.data;
  },
  async me() {
    try {
      const { data } = await api.get('/auth/customer/me');
      return data.data.user;
    } catch (error) {
      // If we are logged in locally but the server fails, we can return the cached user 
      // but we shouldn't create a 'fake' login session if none exists.
      const cached = localStorage.getItem('shopzone_user');
      if (cached) return JSON.parse(cached);
      throw error; 
    }
  },
  async logout() {
    try {
      await api.post('/auth/customer/logout');
    } catch (error) {}
  },
  async updatePassword(currentPassword, newPassword) {
    const { data } = await api.patch('/auth/customer/update-password', { currentPassword, newPassword });
    return data.data;
  }
};
