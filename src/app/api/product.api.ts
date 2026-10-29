import api from "@/lib/axios";

export const productApi = {
  async getAllProducts() {
    const response = await api.get('/products');
    const products = response.data.data.products ?? [];
    // Hide products the admin has disabled.
    return products.filter((p: { isActive?: boolean }) => p.isActive !== false);
  },

  async getProductById(id: string) {
    const response = await api.get(`/products/${id}`);
    const d = response.data.data;
    const product = d?.product ?? d;
    if (product && product.isActive === false) {
      throw new Error("This product is currently unavailable");
    }
    return product;
  }
};
