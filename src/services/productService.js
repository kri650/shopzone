import api from '../utils/api';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data.data;
  },
  async getProductById(id) {
    // Defensive check: avoid calling backend with an obviously invalid id.
    // Backend returns 400 for invalid ObjectId params; handle early on client.
    if (!id || !/^[a-fA-F0-9]{24}$/.test(String(id))) {
      const err = new Error('Invalid product id');
      // Keep shape somewhat similar to AxiosError for callers that expect response
      err.isClientValidation = true;
      throw err;
    }

    const response = await api.get(`/products/${id}`);
    return response.data.data.item;
  },
  async getCategories() {
    const response = await api.get('/categories');
    return response.data.data.items;
  }
};
