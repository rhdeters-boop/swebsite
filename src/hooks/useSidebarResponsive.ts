import { useEffect, useCallback } from 'react';
import { useSidebar } from '../context/SidebarContext';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

interface UseResponsiveOptions {
  onBreakpointChange?: (breakpoint: 'mobile' | 'tablet' | 'desktop') => void;
}

/**
 * Hook to handle responsive behavior for the sidebar
 * - Auto-collapses on tablet viewports (768px - 1024px)
 * - Closes mobile overlay when resizing to larger screens
 * - Restores user preference on desktop viewports
 */
export const useSidebarResponsive = (options?: UseResponsiveOptions) => {
  const { isExpanded, isOpen, toggleExpanded, toggleOpen } = useSidebar();
  
  const getBreakpoint = useCallback((width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width < MOBILE_BREAKPOINT) return 'mobile';
    if (width < TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  }, []);

  const getCurrentBreakpoint = useCallback(() => {
    return getBreakpoint(window.innerWidth);
  }, [getBreakpoint]);

  // Handle viewport changes
  useEffect(() => {
    let previousBreakpoint = getCurrentBreakpoint();
    let userPreferredExpanded = isExpanded;

    const handleResize = () => {
      const width = window.innerWidth;
      const currentBreakpoint = getBreakpoint(width);
      
      // Notify about breakpoint changes
      if (currentBreakpoint !== previousBreakpoint) {
        options?.onBreakpointChange?.(currentBreakpoint);
        previousBreakpoint = currentBreakpoint;
      }

      // Handle mobile breakpoint
      if (currentBreakpoint === 'mobile') {
        // Close mobile overlay if resizing down
        if (isOpen && previousBreakpoint !== 'mobile') {
          toggleOpen();
        }
        return;
      }

      // Handle tablet breakpoint - auto-collapse
      if (currentBreakpoint === 'tablet') {
        // Store user preference before auto-collapsing
        if (previousBreakpoint === 'desktop') {
          userPreferredExpanded = isExpanded;
        }
        
        // Auto-collapse on tablet
        if (isExpanded) {
          toggleExpanded();
        }
        
        // Close mobile overlay if it was open
        if (isOpen) {
          toggleOpen();
        }
        return;
      }

      // Handle desktop breakpoint - restore user preference
      if (currentBreakpoint === 'desktop') {
        // Restore user preference when moving from tablet to desktop
        if (previousBreakpoint === 'tablet' && userPreferredExpanded && !isExpanded) {
          toggleExpanded();
        }
        
        // Close mobile overlay if it was open
        if (isOpen) {
          toggleOpen();
        }
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, isOpen, toggleExpanded, toggleOpen, getBreakpoint, getCurrentBreakpoint, options]);

  return {
    isMobile: getCurrentBreakpoint() === 'mobile',
    isTablet: getCurrentBreakpoint() === 'tablet',
    isDesktop: getCurrentBreakpoint() === 'desktop',
    currentBreakpoint: getCurrentBreakpoint(),
  };
};

// Re-export the useIsMobile hook for backward compatibility
export { useIsMobile } from '../context/SidebarContext';