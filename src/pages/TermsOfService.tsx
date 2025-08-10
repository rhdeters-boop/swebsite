import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  // Redirect to the new dynamic legal page
  return <Navigate to="/legal/terms" replace />;
};

export default TermsOfService;
