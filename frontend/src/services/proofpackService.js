import api from './api';

export const proofpackService = {
  async getProofPackConfig(productId) {
    const res = await api.get(`/proofpack/product/${productId}`);
    return res.data;
  },

  async createOrUpdateProofPack(productId, data) {
    const res = await api.post(`/proofpack/product/${productId}`, data);
    return res.data;
  },

  async getPublicProofPack(shareToken) {
    const res = await api.get(`/proofpack/public/${shareToken}`);
    return res.data;
  },
};
