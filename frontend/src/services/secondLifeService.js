import api from './api';

export const secondLifeService = {
  async recordAction(productId, data) {
    const res = await api.post(`/secondlife/product/${productId}/action`, data);
    return res.data;
  },
};
