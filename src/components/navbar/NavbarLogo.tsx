import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo: React.FC = () => {
  return (
    <Link 
      to="/" 
      className="flex h-full w-64 bg-cover bg-no-repeat bg-left" 
      style={{ backgroundImage: 'url(/logo-transparent.png)' }}
    >
    </Link>
  );
};

export default NavbarLogo;
