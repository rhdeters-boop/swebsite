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
 * Detects if the current device is mobile based on hover capability.
 * Mobile devices typically cannot hover without clicking, so this checks
 * if the browser supports hover interactions.
 * 
 * @returns {boolean} true if mobile device (no hover capability), false if desktop (has hover)
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback - assume desktop
    return false;
  }

  if (window.matchMedia && window.matchMedia("(any-hover: none)").matches) {
    return true;
  } else {
    return false;
  }
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