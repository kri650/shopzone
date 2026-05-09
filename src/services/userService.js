import api from '../utils/api';

export const userService = {
  async getMe() {
    const { data } = await api.get('/users/me');
    return data.data.user;
  },
  async updateProfile(payload) {
    const { data } = await api.patch('/users/me', payload);
    return data.data.user;
  },
  async addAddress(payload) {
    const { data } = await api.post('/users/addresses', payload);
    return data.data.addresses;
  },
  async updateAddress(addressId, payload) {
    const { data } = await api.patch(`/users/addresses/${addressId}`, payload);
    return data.data.addresses;
  },
  async deleteAddress(addressId) {
    const { data } = await api.delete(`/users/addresses/${addressId}`);
    return data.data.addresses;
  },
  async setDefaultAddress(addressId) {
    const { data } = await api.patch(`/users/addresses/${addressId}/default`);
    return data.data.addresses;
  },
  async getWishlist() {
    const { data } = await api.get('/users/wishlist');
    return data.data.items;
  },
  async addToWishlist(productId) {
    const { data } = await api.post(`/users/wishlist/${productId}`);
    return data;
  },
  async removeFromWishlist(productId) {
    const { data } = await api.delete(`/users/wishlist/${productId}`);
    return data;
  }
};
