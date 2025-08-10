import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  // Redirect to the new dynamic legal page
  return <Navigate to="/legal/privacy" replace />;
};

export default PrivacyPolicy;
