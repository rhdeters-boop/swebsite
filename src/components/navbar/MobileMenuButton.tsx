import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <div className="nav:hidden flex items-center">
      <button 
        onClick={onToggle}
        className="p-2 h-12 w-12 flex items-center justify-center text-gray-300 hover:text-void-accent-light transition-colors duration-200 rounded-md hover:bg-void-accent/10"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

export default MobileMenuButton;
