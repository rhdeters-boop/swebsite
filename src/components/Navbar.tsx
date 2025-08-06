import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavigation from './navbar/DesktopNavigation';
import AccountDropdown from './navbar/AccountDropdown';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-abyss-black/95 backdrop-blur-sm shadow-xl border-b border-void-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 nav:h-24 py-4">
          <NavbarLogo />
          <DesktopNavigation isAuthenticated={isAuthenticated} />
          {/* Auth Section - works for both desktop and mobile */}
          <div className="flex items-center space-x-6">
            <AccountDropdown 
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
