import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavbarLogo from './navbar/NavbarLogo';
import DesktopNavigation from './navbar/DesktopNavigation';
import AuthenticatedDesktopAuth from './navbar/AuthenticatedDesktopAuth';
import UnauthenticatedDesktopAuth from './navbar/UnauthenticatedDesktopAuth';
import MobileMenuButton from './navbar/MobileMenuButton';
import MobileMenu from './navbar/MobileMenu';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-abyss-black/95 backdrop-blur-sm shadow-xl border-b border-void-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <NavbarLogo />
          <DesktopNavigation isAuthenticated={isAuthenticated} />
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <AuthenticatedDesktopAuth user={user} onLogout={handleLogout} />
              ) : (
                <UnauthenticatedDesktopAuth />
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <MobileMenuButton 
            isOpen={isMobileMenuOpen} 
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
        </div>

        {/* Mobile menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          onClose={closeMobileMenu}
        />
      </div>
    </nav>
  );
};

export default Navbar;
