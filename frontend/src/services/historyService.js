import api from './api';

export const historyService = {
  async addHistory(productId, data) {
    const res = await api.post(`/history/product/${productId}`, data);
    return res.data;
  },

  async deleteHistory(id) {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  },
};
