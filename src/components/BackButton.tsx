import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-6 left-6 z-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back</span>
      </button>
    </div>
  );
};

export default BackButton;
