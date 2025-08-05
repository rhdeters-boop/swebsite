import React from 'react';
import { Link } from 'react-router-dom';

interface DesktopNavigationProps {
  isAuthenticated: boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ isAuthenticated }) => {
  return (
    <div className="hidden md:flex items-center space-x-6">
      <Link 
        to="/creators" 
        className="text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium relative group px-3 py-2 rounded-md hover:bg-seductive/10"
      >
        <span className="relative z-10">Browse Creators</span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
      </Link>
      
      {isAuthenticated && (
        <Link 
          to="/gallery" 
          className="text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium relative group px-3 py-2 rounded-md hover:bg-seductive/10"
        >
          <span className="relative z-10">Gallery</span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
        </Link>
      )}
    </div>
  );
};

export default DesktopNavigation;
