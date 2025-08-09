/*
  This script literally just checks if your browser is capable of hovering over items without clicking, 
  basically if you have a mouse or not. 
  
  In my opinion, it's better than trying to filter out endless types of phone brands from the 
  navigator's user agent with regex. Generally, mobile devices don't use mice, and those that do 
  should receive the desktop experience. 
  
  USAGE: call isMobile() anywhere, it will return true if it is mobile phone or tablet of any kind 
  and false if it is any type of computer with a mouse.
*/

/**
 * Detects if the current device should use mobile UI layout.
 * This combines hover capability detection with screen size for better accuracy.
 *
 * Logic:
 * - No hover capability = mobile (phones, tablets)
 * - Has hover but small screen (< 768px) = mobile (small laptops, narrow windows)
 * - Has hover and medium+ screen = desktop
 *
 * @returns {boolean} true if should use mobile UI, false for desktop UI
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback - assume desktop
    return false;
  }

  // Check for hover capability first
  const hasHoverCapability = window.matchMedia && !window.matchMedia("(any-hover: none)").matches;
  
  // If no hover capability, definitely mobile
  if (!hasHoverCapability) {
    return true;
  }
  
  // Has hover capability, but check screen size
  // Small screens should still get mobile treatment even with hover
  const screenWidth = window.innerWidth;
  const MOBILE_BREAKPOINT = 768;
  
  return screenWidth < MOBILE_BREAKPOINT;
};

/**
 * Global function for backwards compatibility and easier access.
 * Attaches the isMobile function to the window object.
 */
export const attachGlobalIsMobile = (): void => {
  if (typeof window !== 'undefined') {
    (window as any).isMobile = isMobile;
  }
};