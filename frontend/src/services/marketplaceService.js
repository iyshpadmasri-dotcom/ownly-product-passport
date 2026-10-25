import api from './api';

export const marketplaceService = {
  async getListings(params = {}) {
    const res = await api.get('/marketplace', { params });
    return res.data;
  },

  async getListingById(id) {
    const res = await api.get(`/marketplace/${id}`);
    return res.data;
  },

  async createListing(data) {
    const res = await api.post('/marketplace', data);
    return res.data;
  },

  async getMyListings() {
    const res = await api.get('/marketplace/user/my-listings');
    return res.data;
  },

  async updateListing(id, data) {
    const res = await api.put(`/marketplace/${id}`, data);
    return res.data;
  },

  async deleteListing(id) {
    const res = await api.delete(`/marketplace/${id}`);
    return res.data;
  },

  async createInquiry(listingId, data) {
    const res = await api.post(`/inquiries/listing/${listingId}`, data);
    return res.data;
  },

  async getSellerInquiries() {
    const res = await api.get('/inquiries/seller/all');
    return res.data;
  },

  async updateInquiryStatus(id, status) {
    const res = await api.put(`/inquiries/${id}/status`, { status });
    return res.data;
  },
};
