import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { LogOut, User, Bell, Shield, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccountDropdownProps {
  onClose?: () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    closeDropdown();
    onClose?.(); // Close mobile menu if provided
    logout();
  };

  const handleLinkClick = () => {
    closeDropdown();
    onClose?.(); // Close mobile menu if provided
  };

  // Render trigger button based on authentication state
  const renderTrigger = () => {
    if (isAuthenticated) {
      return (
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 text-abyss-light-gray hover:text-seductive transition-colors duration-300 group px-2 py-3 h-12 rounded-md hover:bg-seductive/10"
        >
          <User className="h-5 w-5 group-hover:text-seductive transition-colors duration-300" />
          {/* Show name and chevron on larger screens, hide on mobile */}
          <span className="hidden sm:inline font-medium">
            {user?.displayName}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 hidden sm:inline ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      );
    }

    // Not authenticated - show dropdown on mobile and medium, buttons on larger screens
    return (
      <>
        {/* Mobile and Medium dropdown trigger */}
        <button
          onClick={toggleDropdown}
          className="lg:hidden flex items-center space-x-2 text-abyss-light-gray hover:text-seductive transition-colors duration-300 group px-2 py-3 h-12 rounded-md hover:bg-seductive/10"
        >
          <User className="h-8 w-8 group-hover:text-seductive transition-colors duration-300" />
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Desktop buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            to="/login"
            onClick={() => onClose?.()}
            className="text-abyss-light-gray hover:text-white transition-all duration-300 font-medium px-2 py-3 h-12 flex items-center rounded-md border border-seductive/40 hover:border-seductive/60 hover:bg-seductive/10"
          >
            Login/Register
          </Link>
          <Link
            to="/become-creator"
            onClick={() => onClose?.()}
            className="bg-gradient-to-r from-lust-violet to-seductive text-white px-2 py-3 h-12 flex items-center rounded-md font-medium hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] border border-seductive/30"
          >
            Become a Creator
          </Link>
        </div>
      </>
    );
  };

  // Render dropdown content
  const renderDropdownContent = () => {
    if (!isDropdownOpen) return null;

    // Authenticated user dropdown
    if (isAuthenticated) {
      return (
        <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-background-primary border border-void-500/20 rounded-xl shadow-elevated z-50">
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
      );
    }

    // Unauthenticated user dropdown (mobile and medium screens)
    return (
      <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-background-primary border border-void-500/20 rounded-xl shadow-elevated z-50 lg:hidden">
        <div className="py-2">
          <Link
            to="/login"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-void-500/10 transition-colors duration-200"
          >
            <User className="h-4 w-4" />
            <span>Login/Register</span>
          </Link>
          
          <Link
            to="/become-creator"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 px-4 py-3 text-seductive hover:text-white hover:bg-seductive/20 transition-colors duration-200 font-medium"
          >
            <Shield className="h-4 w-4" />
            <span>Become a Creator</span>
          </Link>
        </div>
      </div>
    );
  };

  // Invisible overlay component
  const InvisibleOverlay = () => {
    // Only render overlay when dropdown is open
    if (!isDropdownOpen) return null;

    const overlayContent = (
      <div 
        className="fixed inset-0 z-40 cursor-pointer"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'transparent'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeDropdown();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    );

    return createPortal(overlayContent, document.body);
  };

  return (
    <>
      <InvisibleOverlay />
      <div className="relative" ref={dropdownRef}>
        {renderTrigger()}
        {renderDropdownContent()}
      </div>
    </>
  );
};

export default AccountDropdown;
