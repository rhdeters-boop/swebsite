import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo: React.FC = () => {
  return (
    <Link to="/" className="flex group h-full py-2">
        <img src="/logo-transparent.png" alt="Void of Desire Logo" className="h-full w-auto object-contain" />
    </Link>
  );
};

export default NavbarLogo;
