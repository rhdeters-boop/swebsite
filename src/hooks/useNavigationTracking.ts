import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Pages to exclude from being saved as redirect targets
const EXCLUDED_PATHS = [
  '/login',
  '/register', 
  '/register-creator',
  '/registerascreator',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/create-profile',
  '/create-creator-profile'
];

const LAST_PAGE_KEY = 'lastVisitedPage';

export const useNavigationTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't track auth pages or pages with query parameters (like reset-password with tokens)
    const shouldTrack = !EXCLUDED_PATHS.includes(currentPath) && 
                       !EXCLUDED_PATHS.some(path => currentPath.startsWith(path)) &&
                       !location.search.includes('token=');

    if (shouldTrack) {
      // Store the current page as the last visited page
      localStorage.setItem(LAST_PAGE_KEY, currentPath);
    }
  }, [location.pathname, location.search]);
};

export const getLastVisitedPage = (): string => {
  return localStorage.getItem(LAST_PAGE_KEY) || '/dashboard';
};

export const clearLastVisitedPage = () => {
  localStorage.removeItem(LAST_PAGE_KEY);
};
