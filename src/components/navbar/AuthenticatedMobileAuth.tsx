import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

interface User {
  displayName?: string;
}

interface AuthenticatedMobileAuthProps {
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

const AuthenticatedMobileAuth: React.FC<AuthenticatedMobileAuthProps> = ({ user, onLogout, onClose }) => {
  return (
    <div className="space-y-3">
      <Link
        to="/dashboard"
        onClick={onClose}
        className="group flex items-center space-x-3 text-abyss-light-gray hover:text-seductive transition-all duration-300 py-3 px-4 rounded-xl hover:bg-void-accent/10 border border-transparent hover:border-void-accent/20"
      >
        <User className="h-5 w-5 group-hover:text-seductive transition-colors duration-300" />
        <span className="font-medium">
          {user?.displayName}
        </span>
      </Link>
      <button
        onClick={onLogout}
        className="group flex items-center space-x-3 text-abyss-light-gray hover:text-red-400 transition-all duration-300 py-3 px-4 rounded-xl hover:bg-red-400/10 border border-transparent hover:border-red-400/20 w-full"
      >
        <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors duration-300" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AuthenticatedMobileAuth;
