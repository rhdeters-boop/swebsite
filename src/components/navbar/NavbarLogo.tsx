import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center group" aria-label="Void of Desire Home">
      <div className="font-serif tracking-wider text-white transition-colors duration-300 group-hover:text-seductive-light">
        <span className="text-5xl font-bold">VOID</span>
        <span className="text-3xl text-gray-400 mx-1">of</span>
        <span className="text-5xl font-bold">DESIRE</span>
      </div>
    </Link>
  );
};

export default NavbarLogo;
