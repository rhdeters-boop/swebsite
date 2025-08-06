import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AuthNav from './AuthNav';
import NotAuthNav from './NotAuthNav';

interface User {
  displayName?: string;
}

interface AccountDropdownProps {
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
  isMobile?: boolean;
  onClose?: () => void; // For mobile menu closure
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ 
  isAuthenticated, 
  user, 
  onLogout,
  isMobile = false,
  onClose
}) => {
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
    onLogout();
  };

  // Invisible overlay component
  const InvisibleOverlay = () => {
    // Don't render overlay for mobile menu - it has its own overlay system
    if (!isDropdownOpen || isMobile) return null;

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
        {isAuthenticated ? (
          <AuthNav 
            user={user} 
            onLogout={handleLogout}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            closeDropdown={closeDropdown}
            isMobile={isMobile}
            onClose={onClose}
          />
        ) : (
          <NotAuthNav 
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            closeDropdown={closeDropdown}
            isMobile={isMobile}
            onClose={onClose}
          />
        )}
      </div>
    </>
  );
};

export default AccountDropdown;
