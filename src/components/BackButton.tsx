import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/login') {
      navigate('/');
    } else if (currentPath === '/register') {
      navigate('/login');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="absolute top-6 left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 z-10">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-3 text-gray-400 hover:text-white transition-colors duration-200 group"
      >
        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm md:text-base lg:text-lg font-medium">Back</span>
      </button>
    </div>
  );
};

export default BackButton;