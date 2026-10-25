import api from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },

  async updateProfile(formDataOrJson) {
    const isFormData = formDataOrJson instanceof FormData;
    const res = await api.put('/users/profile', formDataOrJson, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/users/password', data);
    return res.data;
  },
};
