import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useSidebar, useIsMobile } from '../../context/SidebarContext';
import type { NavItem } from '../../config/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  depth?: number;
  parentPath?: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  depth = 0,
  parentPath = ''
}) => {
  const location = useLocation();
  const { isExpanded, expandedSections, toggleSection, toggleExpanded } = useSidebar();
  const isMobile = useIsMobile();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCollapsedMenu, setShowCollapsedMenu] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 76 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRef = useRef<HTMLElement>(null);
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === location.pathname;
  const isParentActive = item.children?.some(child => child.path === location.pathname);
  const isSectionExpanded = expandedSections.includes(item.id);
  
  const Icon = item.icon;

  const calculateTooltipPosition = () => {
    if (!itemRef.current) return;
    
    const rect = itemRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // Approximate tooltip width
    const tooltipHeight = 32; // Approximate tooltip height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = 76; // Default position after collapsed sidebar
    let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
    
    // Check if tooltip would overflow viewport
    if (left + tooltipWidth > viewportWidth) {
      left = viewportWidth - tooltipWidth - 10;
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
    if (!isExpanded) {
      calculateTooltipPosition();
      if (!hasChildren) {
        timeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
      }
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      if (!isMobile && !isExpanded) {
        setShowCollapsedMenu(!showCollapsedMenu);
        setShowTooltip(false);
      } else {
        console.log(`Toggling section: ${item.id}`);
        toggleSection(item.id);
      }
    }
  };

  const linkContent = (
    <>
      <div 
        className={`
          flex items-center justify-between w-full px-3 py-2.5 rounded-md
          transition-all duration-200 group relative
          ${depth > 0 ? 'ml-6' : ''}
          ${isActive 
            ? 'bg-void-accent/10 text-void-accent border-l-2 border-void-accent -ml-[2px] pl-[14px]' 
            : 'text-text-secondary hover:text-text-primary hover:bg-background-card'
          }
          ${isParentActive && !isActive ? 'text-text-primary' : ''}
        `}
      >
        <div className="flex items-center min-w-0">
          <Icon 
            className={`
              flex-shrink-0 transition-all duration-200
              ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}
              ${isActive ? 'text-void-accent' : 'text-text-tertiary group-hover:text-text-secondary'}
            `}
          />
          {(isExpanded || isMobile) && (
            <span
              className={`
                ml-3 text-sm font-medium truncate transition-all duration-200
                ${isActive ? 'text-void-accent' : ''}
              `}
            >
              {item.label}
            </span>
          )}
        </div>
        
        {hasChildren && (
          <ChevronDown
            className={`
              w-4 h-4 text-text-tertiary transition-transform duration-200
              ${isSectionExpanded ? 'rotate-180' : ''}
            `}
          />
        )}
      </div>

      {/* Tooltip for collapsed state */}
      {!isExpanded && !hasChildren && showTooltip && (
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
          {item.label}
        </div>
      )}
      
      {/* Collapsed submenu overlay */}
      {!isExpanded && hasChildren && showCollapsedMenu && (
        <div
          className="fixed px-0 py-2 bg-background-card border border-border-primary
                     rounded-md shadow-xl z-[60] min-w-[180px]"
          style={{
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`,
          }}
        >
          <div className="px-3 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border-primary mb-1">
            {item.label}
          </div>
          <div className="space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.id}
                to={child.path || '#'}
                className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
                onClick={() => setShowCollapsedMenu(false)}
              >
                <child.icon className="w-4 h-4 mr-3 text-text-tertiary" />
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Backdrop to close collapsed menu */}
      {!isExpanded && hasChildren && showCollapsedMenu && (
        <div
          className="fixed inset-0 z-[59]"
          onClick={() => setShowCollapsedMenu(false)}
        />
      )}
    </>
  );

  return (
    <li ref={itemRef as React.RefObject<HTMLLIElement>}>
      {item.path ? (
        <Link
          to={item.path}
          className="block relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-current={isActive ? 'page' : undefined}
        >
          {linkContent}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className="w-full text-left relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-expanded={hasChildren ? isSectionExpanded : undefined}
        >
          {linkContent}
        </button>
      )}

      {/* Nested items */}
      {hasChildren && (
        <ul
          className={`
            overflow-hidden transition-all duration-200
            ${isSectionExpanded ? 'max-h-96' : 'max-h-0'}
          `}
          role="group"
        >
          {item.children?.map((child) => (
            <SidebarNavItem
              key={child.id}
              item={child}
              depth={depth + 1}
              parentPath={item.path || parentPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarNavItem;