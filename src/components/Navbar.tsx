import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';

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
    <nav className="bg-abyss-black/95 backdrop-blur-sm shadow-xl border-b border-void-500/20 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <img src="/symbol-transparent.png" alt="Logo" className="h-20 w-20" />
            </div>
          </Link>

          {/* Desktop Navigation and Auth */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/creators" 
                className="text-abyss-light-gray hover:text-seductive transition-colors duration-300 font-medium relative group"
              >
                <span className="relative z-10">Browse Creators</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
              
              {isAuthenticated && (
                <Link 
                  to="/gallery" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-300 font-medium relative group"
                >
                  <span className="relative z-10">Gallery</span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-void-accent to-seductive transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              )}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-300 hover:text-void-accent-light transition-colors duration-200"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">
                      {user?.displayName}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-void-accent-light transition-colors duration-200 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-300 hover:text-void-accent-light transition-colors duration-200 font-medium"
                  >
                    Register
                  </Link>
                  <Link
                    to="/become-creator"
                    className="bg-gradient-to-r from-void-accent to-seductive-light text-white px-4 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-void-accent/25 transition-all duration-200"
                  >
                    Become a Creator
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-void-accent-light transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-void-dark-900 backdrop-blur-sm border-t border-void-500/20 absolute left-0 right-0 top-full shadow-2xl z-50">
            <div className="px-4 py-6 space-y-4">
              <Link 
                to="/creators" 
                onClick={closeMobileMenu}
                className="block text-gray-300 hover:text-void-accent-light transition-colors duration-200 font-medium py-2"
              >
                Browse Creators
              </Link>
              
              {isAuthenticated && (
                <Link 
                  to="/gallery" 
                  onClick={closeMobileMenu}
                  className="block text-gray-300 hover:text-void-accent-light transition-colors duration-200 font-medium py-2"
                >
                  Gallery
                </Link>
              )}

              <hr className="border-void-500/20" />

              {isAuthenticated ? (
                <div className="space-y-4">
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 text-gray-300 hover:text-void-accent-light transition-colors duration-200 py-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">
                      {user?.displayName}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-200 py-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-gray-300 hover:text-void-accent-light transition-colors duration-200 font-medium py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block text-gray-300 hover:text-void-accent-light transition-colors duration-200 font-medium py-2"
                  >
                    Register
                  </Link>
                  <Link
                    to="/become-creator"
                    onClick={closeMobileMenu}
                    className="block bg-gradient-to-r from-void-accent to-seductive-light text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-void-accent/25 transition-all duration-200 text-center"
                  >
                    Become a Creator
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
