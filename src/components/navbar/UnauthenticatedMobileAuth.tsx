import React from 'react';
import { Link } from 'react-router-dom';

interface UnauthenticatedMobileAuthProps {
  onClose: () => void;
}

const UnauthenticatedMobileAuth: React.FC<UnauthenticatedMobileAuthProps> = ({ onClose }) => {
  return (
    <>
      <div className="space-y-1 border-t border-void-500/30 pt-2 mb-2">
        <Link
          to="/login"
          onClick={onClose}
          className="group flex items-center text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium py-3 px-4 rounded-xl hover:bg-seductive/10 border border-transparent hover:border-seductive/20"
        >
          <span className="relative">
            Login
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </span>
        </Link>
        <Link
          to="/register"
          onClick={onClose}
          className="group flex items-center text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium py-3 px-4 rounded-xl hover:bg-seductive/10 border border-seductive/20 hover:border-seductive/40"
        >
          <span className="relative">
            Register
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </span>
        </Link>
      </div>
      <div className="mt-4">
        <Link
          to="/become-creator"
          onClick={onClose}
          className="group flex items-center justify-center bg-gradient-to-r from-lust-violet to-seductive text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-seductive/25 transition-all duration-300 transform hover:scale-[1.02] border border-seductive/30 hover:border-seductive/50"
        >
          <span className="relative">
            Become a Creator
          </span>
        </Link>
      </div>
    </>
  );
};

export default UnauthenticatedMobileAuth;
