import React from 'react';
import { Link } from 'react-router-dom';

const UnauthenticatedDesktopAuth: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <Link
        to="/login"
        className="text-abyss-light-gray hover:text-white transition-all duration-300 font-medium px-2 py-3 h-12 flex items-center rounded-md border border-seductive/40 hover:border-seductive/60 hover:bg-seductive/10"
      >
        Login/Register
      </Link>
      <Link
        to="/become-creator"
        className="bg-gradient-to-r from-lust-violet to-seductive text-white px-2 py-3 h-12 flex items-center rounded-md font-medium hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] border border-seductive/30"
      >
        Become a Creator
      </Link>
    </div>
  );
};

export default UnauthenticatedDesktopAuth;
