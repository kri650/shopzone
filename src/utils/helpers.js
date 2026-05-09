// Helper functions for ShopZone React App

export const formatPrice = (n) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
};

export const discountPercent = (price, compare) => {
  if (!compare || compare === 0) return 0;
  return Math.round(((compare - price) / compare) * 100);
};

export const truncate = (str, n) => {
  if (str.length <= n) return str;
  return str.slice(0, n) + '...';
};

export const getRatingStars = (r) => {
  const fullStars = Math.round(r);
  const emptyStars = 5 - fullStars;
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    processing: '#17a2b8',
    shipped: '#007bff',
    delivered: '#20c997',
    cancelled: '#dc3545',
    returned: '#6f42c1',
  };
  return colors[status] || '#6c757d';
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
};
