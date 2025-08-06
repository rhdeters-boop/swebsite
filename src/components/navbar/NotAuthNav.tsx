import React from 'react';
import { Link } from 'react-router-dom';

interface NotAuthNavProps {
  isDropdownOpen?: boolean;
  toggleDropdown?: () => void;
  closeDropdown?: () => void;
  isMobile?: boolean;
  onClose?: () => void; // For mobile menu closure
}

const NotAuthNav: React.FC<NotAuthNavProps> = ({
  isDropdownOpen: _isDropdownOpen = false,
  toggleDropdown: _toggleDropdown = () => {},
  closeDropdown: _closeDropdown = () => {},
  isMobile: _isMobile = false,
  onClose
}) => {
  const handleLinkClick = () => {
    onClose?.(); // Close mobile menu if provided
  };

  return (
    <div className="flex items-center space-x-3">
      <Link
        to="/login"
        onClick={handleLinkClick}
        className="text-abyss-light-gray hover:text-white transition-all duration-300 font-medium px-2 py-3 h-12 flex items-center rounded-md border border-seductive/40 hover:border-seductive/60 hover:bg-seductive/10"
      >
        Login/Register
      </Link>
      <Link
        to="/become-creator"
        onClick={handleLinkClick}
        className="bg-gradient-to-r from-lust-violet to-seductive text-white px-2 py-3 h-12 flex items-center rounded-md font-medium hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] border border-seductive/30"
      >
        Become a Creator
      </Link>
    </div>
  );
};

export default NotAuthNav;
