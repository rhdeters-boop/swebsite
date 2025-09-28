import React, { useEffect, useRef } from 'react';
import { useSidebar, useIsMobile } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { navigationConfig } from '../../config/navigation';
import SidebarToggle from './SidebarToggle';
import SidebarNavItem from './SidebarNavItem';
import SidebarMobileOverlay from './SidebarMobileOverlay';
import VoidLogo from '../VoidLogo';
import './sidebar.css';

const Sidebar: React.FC = () => {
  const { isExpanded } = useSidebar();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLElement>(null);

  console.log("Rendering Sidebar - isExpanded:", isExpanded, "isMobile:", isMobile, "user:", user);

  // Filter navigation sections based on auth state and user role
  const filteredSections = navigationConfig.filter(section => {
    // Check section-level auth requirements
    if (section.requiredAuth && !user) return false;
    if (section.requiredRole && (!user || !section.requiredRole.includes(user.role))) return false;
    
    // Filter items within section
    const filteredItems = section.items.filter(item => {
      if (item.requiredAuth && !user) return false;
      if (item.requiredRole && (!user || !item.requiredRole.includes(user.role))) return false;
      return true;
    });
    
    // Only show section if it has visible items
    return filteredItems.length > 0;
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard nav when sidebar is focused
      if (!sidebarRef.current?.contains(document.activeElement)) return;
      
      const focusableElements = sidebarRef.current.querySelectorAll(
        'a, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const focusedIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex < focusableElements.length - 1) {
            (focusableElements[focusedIndex + 1] as HTMLElement).focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex > 0) {
            (focusableElements[focusedIndex - 1] as HTMLElement).focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          (focusableElements[0] as HTMLElement)?.focus();
          break;
        case 'End':
          e.preventDefault();
          (focusableElements[focusableElements.length - 1] as HTMLElement)?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sidebarContent = (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-void-accent focus:text-white focus:rounded-md focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Header with logo and toggle */}
      <div className="relative flex items-center justify-between p-4 min-h-[96px]">
        {isExpanded || isMobile ? (
          <>
            <VoidLogo className={`transition-all duration-200 ${isMobile ? 'w-12 h-16' : 'w-12 h-16'}`} />
            <SidebarToggle />
          </>
        ) : (
          <div className="w-full flex justify-center">
            <SidebarToggle />
          </div>
        )}
      </div>

      {/* Navigation sections */}
      {console.log("Filtered Sections:", filteredSections)}
      <nav 
        className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin"
        aria-label="Main navigation"
      >
        {filteredSections.map((section, index) => (
          <div key={section.id} className={index > 0 ? 'mt-6' : ''}>
            {isExpanded && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1 text-white" role="list">
              {section.items.map(item => (
                <SidebarNavItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="p-4">
          <p className="text-xs text-text-muted text-center">
            © {new Date().getFullYear()} Void of Desire
          </p>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <SidebarMobileOverlay>
        <aside
          ref={sidebarRef}
          className="flex flex-col h-full bg-background-primary"
          role="navigation"
        >
          {sidebarContent}
        </aside>
      </SidebarMobileOverlay>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed left-0 top-0 h-full bg-background-primary border-r-4 border-border-primary
        shadow-xl flex flex-col transition-all duration-200 ease-out z-50
        ${isExpanded ? 'w-60' : 'w-20'}
      `}
      role="navigation"
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;