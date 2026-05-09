// Constants for ShopZone React App

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_LOGIN: '/admin/login',
  VENDOR_LOGIN: '/vendor/login',
  WAREHOUSE_LOGIN: '/warehouse/login',

  // Marketplace
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order/success',
  MY_ORDERS: '/my-orders',
  ORDER_TRACKING: '/order/tracking/:id',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  MANAGE_PRODUCTS: '/admin/manage-products',
  MANAGE_ORDERS: '/admin/manage-orders',
  MANAGE_USERS: '/admin/manage-users',
  MANAGE_VENDORS: '/admin/manage-vendors',
  MANAGE_WAREHOUSE: '/admin/manage-warehouse',
  VENDOR_KYC_REVIEW: '/admin/vendor-kyc-review',
  ADD_WAREHOUSE_STAFF: '/admin/add-warehouse-staff',
  ANALYTICS: '/admin/analytics',

  // Vendor
  VENDOR_DASHBOARD: '/vendor/dashboard',

  // Warehouse
  WAREHOUSE_DASHBOARD: '/warehouse/dashboard',
  SHIPMENT_LIST: '/warehouse/shipments',
  SHIPMENT_DETAIL: '/warehouse/shipment/:id',
};

export const STATUS_LIST = ['pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export const CATEGORY_LIST = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Books',
  'Sports & Outdoors',
  'Beauty & Personal Care',
  'Toys & Games',
  'Groceries',
];

export const ORDER_STATUS_COLORS = {
  pending: '#ffc107',      // yellow
  processing: '#17a2b8',   // info blue
  shipped: '#007bff',      // blue
  delivered: '#20c997',    // teal
  cancelled: '#dc3545',    // red
  returned: '#6f42c1',     // purple
};
