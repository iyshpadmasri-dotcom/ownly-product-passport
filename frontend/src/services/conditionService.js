import api from './api';

export const conditionService = {
  async getConditionReport(productId) {
    const res = await api.get(`/condition/product/${productId}`);
    return res.data;
  },

  async saveConditionReport(productId, data) {
    const res = await api.post(`/condition/product/${productId}`, data);
    return res.data;
  },
};
