import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface ArticleBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const ArticleBreadcrumb: React.FC<ArticleBreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-text-tertiary flex-shrink-0" aria-hidden="true" />
          )}
          {item.current ? (
            <span className="text-text-tertiary" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.href}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default ArticleBreadcrumb;