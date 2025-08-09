import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { NavItem } from '../../config/navigation';

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
  const { isExpanded, expandedSections, toggleSection } = useSidebar();
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === location.pathname;
  const isParentActive = item.children?.some(child => child.path === location.pathname);
  const isSectionExpanded = expandedSections.includes(item.id);
  
  const Icon = item.icon;

  const handleMouseEnter = () => {
    if (!isExpanded && !hasChildren) {
      timeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
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
      toggleSection(item.id);
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
          {isExpanded && (
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
        
        {hasChildren && isExpanded && (
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
          className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-text-primary 
                     bg-background-card border border-border-primary rounded-md whitespace-nowrap
                     shadow-lg z-50 pointer-events-none"
          role="tooltip"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {item.label}
        </div>
      )}
    </>
  );

  return (
    <li>
      {item.path && !hasChildren ? (
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
          {item.children.map((child) => (
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