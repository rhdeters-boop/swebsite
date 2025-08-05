import React from 'react';
import { Link } from 'react-router-dom';

const UnauthenticatedDesktopAuth: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <Link
        to="/login"
        className="text-abyss-light-gray hover:text-seductive transition-all duration-300 font-medium px-4 py-2 rounded-md border border-transparent hover:border-seductive/30 hover:bg-seductive/5"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="text-abyss-light-gray hover:text-white transition-all duration-300 font-medium px-4 py-2 rounded-md border border-seductive/40 hover:border-seductive/60 hover:bg-seductive/10"
      >
        Register
      </Link>
      <Link
        to="/become-creator"
        className="bg-gradient-to-r from-lust-violet to-seductive text-white px-4 py-2 rounded-md font-medium hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] border border-seductive/30"
      >
        Become a Creator
      </Link>
    </div>
  );
};

export default UnauthenticatedDesktopAuth;
