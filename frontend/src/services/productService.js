import api from './api';

export const productService = {
  async getSummary() {
    const res = await api.get('/products/summary');
    return res.data;
  },

  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getProductById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(formDataOrJson) {
    const isFormData = formDataOrJson instanceof FormData;
    const res = await api.post('/products', formDataOrJson, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async updateProduct(id, formDataOrJson) {
    const isFormData = formDataOrJson instanceof FormData;
    const res = await api.put(`/products/${id}`, formDataOrJson, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};
