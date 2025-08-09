import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useSidebar, useIsMobile } from '../../context/SidebarContext';

const SidebarToggle: React.FC = () => {
  const { isExpanded, isOpen, toggleExpanded, toggleOpen } = useSidebar();
  const isMobile = useIsMobile();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (isMobile) {
      toggleOpen();
    } else {
      toggleExpanded();
    }
  };

  const isActive = isMobile ? isOpen : isExpanded;

  const calculateTooltipPosition = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 120; // Approximate tooltip width
    const tooltipHeight = 32; // Approximate tooltip height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = rect.right + 8;
    let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
    
    // Check if tooltip would overflow viewport
    if (left + tooltipWidth > viewportWidth) {
      left = rect.left - tooltipWidth - 8;
    }
    
    // Ensure tooltip stays within vertical viewport bounds
    if (top < 10) {
      top = 10;
    } else if (top + tooltipHeight > viewportHeight - 10) {
      top = viewportHeight - tooltipHeight - 10;
    }
    
    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      calculateTooltipPosition();
      timeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-md
                 bg-background-secondary hover:bg-background-card
                 border border-border-primary hover:border-border-secondary
                 text-text-secondary hover:text-text-primary
                 transition-all duration-200 focus-ring"
      aria-label={isActive ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isActive}
    >
      <div className="relative w-5 h-5">
        {/* Hamburger icon */}
        <span
          className={`absolute left-0 top-0 block h-0.5 w-5 bg-current transform transition-all duration-200 origin-center ${
            isActive 
              ? 'rotate-45 translate-y-2.5' 
              : 'translate-y-0'
          }`}
        />
        <span
          className={`absolute left-0 top-2 block h-0.5 w-5 bg-current transition-all duration-200 ${
            isActive ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
        />
        <span
          className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transform transition-all duration-200 origin-center ${
            isActive 
              ? '-rotate-45 -translate-y-1.5' 
              : 'translate-y-0'
          }`}
        />
      </div>

      {/* Tooltip for desktop with viewport boundary detection */}
      {!isMobile && showTooltip && (
        <div
          className="fixed px-2 py-1 text-xs font-medium text-text-primary
                     bg-background-card border border-border-primary rounded-md whitespace-nowrap
                     shadow-lg z-[60] pointer-events-none"
          role="tooltip"
          style={{
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`,
          }}
        >
          {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        </div>
      )}
    </button>
  );
};

export default SidebarToggle;