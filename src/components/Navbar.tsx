import React from 'react';
import NavbarLogo from './navigation/NavbarLogo'
import AccountDropdown from './navigation/AccountDropdown';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-background-primary/95 backdrop-blur-sm shadow-xl border-b border-border-primary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 nav:h-24 py-4">
          <NavbarLogo />
          {/* Auth Section - works for both desktop and mobile */}
          <div className="flex items-center space-x-6">
            <AccountDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;