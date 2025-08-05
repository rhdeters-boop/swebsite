import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 group">
      <div className="relative">
        <img src="/symbol-transparent.png" alt="Logo" className="h-20 w-20" />
      </div>
    </Link>
  );
};

export default NavbarLogo;
