import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

interface User {
  displayName?: string;
}

interface AuthenticatedDesktopAuthProps {
  user: User | null;
  onLogout: () => void;
}

const AuthenticatedDesktopAuth: React.FC<AuthenticatedDesktopAuthProps> = ({ user, onLogout }) => {
  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/dashboard"
        className="flex items-center space-x-2 text-abyss-light-gray hover:text-seductive transition-colors duration-300 group px-2 py-3 h-12 rounded-md hover:bg-seductive/10"
      >
        <User className="h-5 w-5 group-hover:text-seductive transition-colors duration-300" />
        <span className="hidden sm:inline font-medium">
          {user?.displayName}
        </span>
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center space-x-1 text-abyss-light-gray hover:text-red-400 transition-colors duration-300 group px-2 py-3 h-12 rounded-md hover:bg-red-400/10"
        title="Logout"
      >
        <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors duration-300" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default AuthenticatedDesktopAuth;
