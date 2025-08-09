import React from 'react';
import { Menu, X } from 'lucide-react';
import { useSidebar, useIsMobile } from '../../context/SidebarContext';

const SidebarToggle: React.FC = () => {
  const { isExpanded, isOpen, toggleExpanded, toggleOpen } = useSidebar();
  const isMobile = useIsMobile();

  const handleClick = () => {
    if (isMobile) {
      toggleOpen();
    } else {
      toggleExpanded();
    }
  };

  const isActive = isMobile ? isOpen : isExpanded;

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-md 
                 bg-background-secondary hover:bg-background-card
                 border border-border-primary hover:border-border-secondary
                 text-text-secondary hover:text-text-primary
                 transition-all duration-200 focus-ring group"
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

      {/* Tooltip for desktop */}
      {!isMobile && (
        <span 
          className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-text-primary 
                     bg-background-card border border-border-primary rounded-md whitespace-nowrap
                     opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200
                     shadow-lg z-50"
          role="tooltip"
        >
          {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        </span>
      )}
    </button>
  );
};

export default SidebarToggle;