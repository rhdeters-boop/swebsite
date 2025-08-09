import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center group" aria-label="Void of Desire Home">
      <div className="font-serif tracking-wider text-text-primary transition-colors duration-300 group-hover:text-seductive-light">
        <span className="text-2xl sm:text-4xl lg:text-5xl font-bold">VOID</span>
        <span className="text-xl sm:text-3xl lg:text-3xl text-text-muted mx-1">of</span>
        <span className="text-2xl sm:text-4xl lg:text-5xl font-bold">DESIRE</span>
      </div>
    </Link>
  );
};

export default NavbarLogo;
