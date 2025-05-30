import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute; 