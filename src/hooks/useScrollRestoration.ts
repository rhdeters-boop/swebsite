import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface ScrollPositions {
  [pathname: string]: ScrollPosition;
}

// Global scroll positions storage
const scrollPositions: ScrollPositions = {};

export const useScrollRestoration = (shouldRestore: boolean = true) => {
  const location = useLocation();
  const savedScrollRef = useRef<ScrollPosition | null>(null);
  const isRestoringRef = useRef(false);

  // Save scroll position when navigating away
  useEffect(() => {
    const saveScrollPosition = () => {
      if (!isRestoringRef.current) {
        scrollPositions[location.pathname] = {
          x: window.scrollX,
          y: window.scrollY,
          timestamp: Date.now()
        };
      }
    };

    // Save scroll position before unloading or navigating
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Save on route change (when component unmounts)
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [location.pathname]);

  // Restore scroll position when component mounts
  useEffect(() => {
    if (!shouldRestore) {
      window.scrollTo(0, 0);
      return;
    }

    const savedPosition = scrollPositions[location.pathname];
    
    if (savedPosition) {
      // Check if the saved position is recent (within last 10 minutes)
      const isRecent = Date.now() - savedPosition.timestamp < 10 * 60 * 1000;
      
      if (isRecent) {
        isRestoringRef.current = true;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(savedPosition.x, savedPosition.y);
          savedScrollRef.current = savedPosition;
          
          // Reset flag after a short delay
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        });
      } else {
        // Position is too old, scroll to top
        window.scrollTo(0, 0);
        delete scrollPositions[location.pathname];
      }
    } else {
      // No saved position, scroll to top
      window.scrollTo(0, 0);
    }
  }, [location.pathname, shouldRestore]);

  // Utility function to manually save current position
  const saveCurrentPosition = () => {
    scrollPositions[location.pathname] = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    };
  };

  // Utility function to clear saved position
  const clearSavedPosition = (pathname?: string) => {
    const pathToClear = pathname || location.pathname;
    delete scrollPositions[pathToClear];
  };

  // Check if current position was restored
  const wasRestored = savedScrollRef.current !== null;

  return {
    saveCurrentPosition,
    clearSavedPosition,
    wasRestored,
    scrollPositions: { ...scrollPositions } // Return copy for debugging
  };
};

// Hook specifically for pages that should maintain scroll position
export const useScrollMaintenance = () => {
  return useScrollRestoration(true);
};

// Hook for pages that should always scroll to top
export const useScrollToTop = () => {
  return useScrollRestoration(false);
};
