

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute2 = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem('studentLoggedIn') === 'true';

  return isLoggedIn ? children : <Navigate to="/student-login" />;
};

export default ProtectedRoute2;
