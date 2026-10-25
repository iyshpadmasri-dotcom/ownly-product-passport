import api from './api';

export const transferService = {
  async initiateTransfer(data) {
    const res = await api.post('/transfers/initiate', data);
    return res.data;
  },

  async getTransfers() {
    const res = await api.get('/transfers');
    return res.data;
  },

  async respondTransfer(id, action) {
    const res = await api.put(`/transfers/${id}/respond`, { action });
    return res.data;
  },

  async cancelTransfer(id) {
    const res = await api.put(`/transfers/${id}/cancel`);
    return res.data;
  },
};
