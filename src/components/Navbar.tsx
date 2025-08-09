import React from 'react';
import { Menu } from 'lucide-react';
import NavbarLogo from './navigation/NavbarLogo'
import AccountDropdown from './navigation/AccountDropdown';
import { useSidebar, useIsMobile } from '../context/SidebarContext';

const Navbar: React.FC = () => {
  const { toggleOpen } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <nav className="bg-background-primary/95 backdrop-blur-sm shadow-xl border-b border-border-primary sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 nav:h-24 pt-4 pb-2">
          <div className="flex items-end gap-3">
            {/* Mobile menu toggle - only show on mobile */}
            {isMobile && (
              <button
                onClick={toggleOpen}
                className="inline-flex items-center justify-center w-10 h-10 rounded-md
                           bg-background-secondary hover:bg-background-card
                           border border-border-primary hover:border-border-secondary
                           text-text-secondary hover:text-text-primary
                           transition-all duration-200 focus-ring"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <NavbarLogo />
          </div>
          {/* Account Dropdown - works for both desktop and mobile */}
          <div className="flex items-center space-x-6">
            <AccountDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;