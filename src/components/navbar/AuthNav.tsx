import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Bell, Shield, CreditCard, ChevronDown } from 'lucide-react';

interface User {
  displayName?: string;
}

interface AuthNavProps {
  user: User | null;
  onLogout: () => void;
  isDropdownOpen?: boolean;
  toggleDropdown?: () => void;
  closeDropdown?: () => void;
  isMobile?: boolean;
  onClose?: () => void; // For mobile menu closure
}

const AuthNav: React.FC<AuthNavProps> = ({ 
  user, 
  onLogout,
  isDropdownOpen = false,
  toggleDropdown = () => {},
  closeDropdown = () => {},
  isMobile: _isMobile = false,
  onClose
}) => {
  const handleLogout = () => {
    closeDropdown();
    onClose?.(); // Close mobile menu if provided
    onLogout();
  };

  const handleLinkClick = () => {
    closeDropdown();
    onClose?.(); // Close mobile menu if provided
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-abyss-light-gray hover:text-seductive transition-colors duration-300 group px-2 py-3 h-12 rounded-md hover:bg-seductive/10"
      >
        <User className="h-5 w-5 group-hover:text-seductive transition-colors duration-300" />
        <span className="hidden sm:inline font-medium">
          {user?.displayName}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background-primary border border-void-500/20 rounded-xl shadow-elevated z-50">
          <div className="py-2">
            <Link
              to="/profile"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-void-500/10 transition-colors duration-200"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Link
              to="/notifications"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-void-500/10 transition-colors duration-200"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </Link>
            
            <Link
              to="/security"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-void-500/10 transition-colors duration-200"
            >
              <Shield className="h-4 w-4" />
              <span>Security & Privacy</span>
            </Link>
            
            <Link
              to="/billing"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-void-500/10 transition-colors duration-200"
            >
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </Link>
            
            <hr className="my-2 border-void-500/20" />
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthNav;
