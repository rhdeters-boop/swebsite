import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigationTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Get existing history
    const navHistory: string[] = JSON.parse(sessionStorage.getItem('authNavHistory') || '[]');
    
    // Add current path to history (keep last 10 entries to prevent memory issues)
    const updatedHistory = [...navHistory, currentPath].slice(-10);
    
    // Update sessionStorage
    sessionStorage.setItem('authNavHistory', JSON.stringify(updatedHistory));
  }, [location.pathname]);
};
