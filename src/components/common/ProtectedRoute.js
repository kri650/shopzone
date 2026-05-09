import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Unauthenticated - redirect to appropriate login based on role or default to /login
  if (!isAuthenticated) {
    // For unauthenticated users, redirect to customer login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Role-based redirect to specific login pages
    const redirectPath = getRedirectPath(role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const getRedirectPath = (role) => {
  switch (role) {
    case 'vendor':
      return '/vendor/login';
    case 'admin':
      return '/admin/login';
    case 'warehouse':
      return '/warehouse/login';
    default:
      return '/login';
  }
};

export default ProtectedRoute;