import React from 'react';
import MobileNavigation from './MobileNavigation';
import AuthenticatedMobileAuth from './AuthenticatedMobileAuth';
import UnauthenticatedMobileAuth from './UnauthenticatedMobileAuth';

interface User {
  displayName?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  isAuthenticated, 
  user, 
  onLogout, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="nav:hidden bg-void-dark-900 backdrop-blur-lg border-t border-void-500/30 absolute left-0 right-0 top-full shadow-2xl z-50">
      <div className="px-4 pt-2 pb-8">
        <MobileNavigation isAuthenticated={isAuthenticated} onClose={onClose} />
        
        {isAuthenticated ? (
          <AuthenticatedMobileAuth 
            user={user} 
            onLogout={onLogout} 
            onClose={onClose} 
          />
        ) : (
          <UnauthenticatedMobileAuth onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
