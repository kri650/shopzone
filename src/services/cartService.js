import api from '../utils/api';

export const cartService = {
  async getCart() {
    const { data } = await api.get('/cart');
    return data.data.cart;
  },
  async addToCart(payload) {
    const { data } = await api.post('/cart', payload);
    return data.data.cart;
  },
  async updateCartItem(itemId, quantity) {
    const { data } = await api.patch(`/cart/${itemId}`, { quantity });
    return data.data.cart;
  },
  async removeCartItem(itemId) {
    const { data } = await api.delete(`/cart/${itemId}`);
    return data.data.cart;
  },
  async clearCart() {
    await api.delete('/cart');
  },
  async applyCoupon(couponCode) {
    const { data } = await api.post('/cart/coupon', { couponCode });
    return data.data.cart;
  },
  async removeCoupon() {
    const { data } = await api.delete('/cart/coupon');
    return data.data.cart;
  }
};
