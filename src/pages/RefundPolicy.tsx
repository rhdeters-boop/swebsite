import React from 'react';
import { Navigate } from 'react-router-dom';

const RefundPolicy: React.FC = () => {
  // Redirect to the new dynamic legal page
  // Note: We'll need to add a refund policy document to legalContent.ts
  return <Navigate to="/legal/refund" replace />;
};

export default RefundPolicy;
