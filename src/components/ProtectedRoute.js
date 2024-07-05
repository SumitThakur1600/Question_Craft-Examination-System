import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem('teacherLoggedIn') === 'true';

  return isLoggedIn ? children : <Navigate to="/teacher-login" />;
};

export default ProtectedRoute;
