import api from './api';

export const documentService = {
  async addDocument(productId, formDataOrJson) {
    const isFormData = formDataOrJson instanceof FormData;
    const res = await api.post(`/documents/product/${productId}`, formDataOrJson, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async deleteDocument(id) {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  getDocumentViewUrl(id) {
    return `/api/documents/${id}/view`;
  },
};
