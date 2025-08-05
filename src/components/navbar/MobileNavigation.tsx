import React from 'react';
import { Link } from 'react-router-dom';

interface MobileNavigationProps {
  isAuthenticated: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isAuthenticated, onClose }) => {
  return (
    <div className="mb-2">
      <Link 
        to="/creators" 
        onClick={onClose}
        className="group flex items-center text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium py-3  px-4 rounded-xl hover:bg-seductive/10 border border-transparent hover:border-seductive/20 mb-2"
      >
        <span className="relative">
          Browse Creators
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
        </span>
      </Link>
      
      {isAuthenticated && (
        <Link 
          to="/gallery" 
          onClick={onClose}
          className="group flex items-center text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium py-3 px-4 rounded-xl hover:bg-seductive/10 border border-transparent hover:border-seductive/20"
        >
          <span className="relative">
            Gallery
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </span>
        </Link>
      )}
    </div>
  );
};

export default MobileNavigation;
