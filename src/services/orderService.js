import api from '../utils/api';

export const orderService = {
  async createOrder(payload) {
    const { data } = await api.post('/orders', payload);
    return data.data.order;
  },
  async getMyOrders() {
    const { data } = await api.get('/orders/mine');
    return data.data.items;
  },
  async getOrderById(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data.data.order;
  },
  async trackOrder(id) {
    const { data } = await api.get(`/orders/${id}/track`);
    return data.data;
  },
  async requestReturn(orderId, itemId, payload) {
    const { data } = await api.post(`/orders/${orderId}/items/${itemId}/return`, payload);
    return data.data;
  }
};
