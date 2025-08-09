import { useEffect, useCallback } from 'react';
import { useSidebar, useIsMobile } from '../context/SidebarContext';
import { isMobile as detectMobile } from '../utils/mobileDetection';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

interface UseResponsiveOptions {
  onBreakpointChange?: (breakpoint: 'mobile' | 'desktop') => void;
}

/**
 * Hook to handle responsive behavior for the sidebar
 * - Mobile devices get overlay sidebar behavior
 * - Non-mobile devices maintain user preference for collapsed/expanded state
 * - Closes mobile overlay when switching to non-mobile devices
 */
export const useSidebarResponsive = (options?: UseResponsiveOptions) => {
  const { isExpanded, isOpen, toggleExpanded, toggleOpen } = useSidebar();
  
  const getBreakpoint = useCallback((width: number): 'mobile' | 'desktop' => {
    // Use the new hybrid mobile detection
    const isMobileDevice = detectMobile();
    if (isMobileDevice) return 'mobile';
    
    // All non-mobile devices are treated as desktop (no tablet distinction)
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
        // Close mobile overlay if resizing down from desktop
        if (isOpen && previousBreakpoint !== 'mobile') {
          toggleOpen();
        }
        return;
      }

      // Handle desktop breakpoint - maintain user preference
      if (currentBreakpoint === 'desktop') {
        // Close mobile overlay if it was open
        if (isOpen) {
          toggleOpen();
        }
        // Don't auto-expand or collapse - let user control the sidebar state
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
    isMobile: detectMobile(), // Use hybrid detection consistently
    isDesktop: getCurrentBreakpoint() === 'desktop',
    currentBreakpoint: getCurrentBreakpoint(),
  };
};

// Re-export the useIsMobile hook for backward compatibility
export { useIsMobile } from '../context/SidebarContext';